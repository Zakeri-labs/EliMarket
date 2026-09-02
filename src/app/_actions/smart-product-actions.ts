"use server";

import sharp from "sharp";
import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { actionErrorMessage } from "@/i18n/action-error";
import { generateBlurHashFromBuffer } from "@/lib/images/generate-blur-hash";
import {
  enhanceProductPhoto,
  buildProductPhotoFramings,
} from "@/lib/images/enhance-product-photo";
import {
  draftCatalogFromImages,
  matchCategoryId,
} from "@/lib/ai/vision-catalog";
import { searchProductImagesWithOpenAi } from "@/lib/ai/web-image-search";
import { generateProductContextShots } from "@/lib/ai/generate-product-context-shots";
import { generateProductCoverShots } from "@/lib/ai/generate-product-cover-shot";
import {
  AI_IMAGE_GENERATION_ENABLED,
  AI_IMAGE_MODEL,
  AI_IMAGE_PROVIDER,
  AI_MAX_CONTEXT_SHOTS,
  AI_MAX_STUDIO_SHOTS,
  AI_WEB_IMAGE_SEARCH_ENABLED,
} from "@/lib/ai/ai-config";
import { getGeminiApiKey } from "@/lib/ai/gemini-client";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";
import { slugifyProductName } from "@/lib/products/slug";
import { coverFromImageInputs } from "@/lib/products/gallery";
import {
  syncProductFeatures,
  syncProductImages,
} from "@/app/_actions/product-actions";
import type { ProductImageInput } from "@/app/_types/database.types";

export type SmartProductImage = {
  originalUrl: string;
  processedUrl: string;
  blurHash: string;
  source: "upload" | "web" | "ai-generated";
  sourceLabel?: string;
};

const MAX_DRAFT_IMAGES = 8;
const MAX_WEB_IMAGES = 3;
const MAX_AI_CONTEXT_SHOTS = AI_MAX_CONTEXT_SHOTS;

function guessMime(url: string, header: string | null) {
  if (header?.startsWith("image/")) return header.split(";")[0]!;
  if (url.toLowerCase().includes(".png")) return "image/png";
  if (url.toLowerCase().includes(".webp")) return "image/webp";
  return "image/jpeg";
}

async function fetchImage(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to read image (${res.status})`);
  const bytes = Buffer.from(await res.arrayBuffer());
  return { bytes, mime: guessMime(url, res.headers.get("content-type")) };
}

/** Fetch a web-search result and reject anything that isn't a plausible real photo. */
async function fetchAndValidateWebImage(url: string): Promise<{ bytes: Buffer; mime: string } | null> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.startsWith("image/")) return null;
    const bytes = Buffer.from(await res.arrayBuffer());
    if (bytes.length < 4_000 || bytes.length > 12 * 1024 * 1024) return null;
    const metadata = await sharp(bytes).metadata();
    if (!metadata.width || !metadata.height || metadata.width < 300 || metadata.height < 300) {
      return null;
    }
    return { bytes, mime: contentType.split(";")[0] || "image/jpeg" };
  } catch {
    return null;
  }
}

async function uploadProcessedPng(supabase: SupabaseClient, png: Buffer) {
  const path = `products/ai/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { error } = await supabase.storage.from("product-images").upload(path, png, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

async function uploadWebImage(supabase: SupabaseClient, bytes: Buffer, mime: string) {
  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const path = `products/web/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from("product-images").upload(path, bytes, {
    contentType: mime,
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Build the primary gallery images for each uploaded photo: premium
 * AI-generated studio shots (image 1 is always the standard fixed cover
 * framing, further shots vary lighting/composition — marked
 * "ai-generated", admin must verify since fine print can come out wrong)
 * plus, if the AI didn't cover the full target count, deterministic,
 * pixel-safe framings filling the rest as a guaranteed-accurate backup.
 */
async function buildEnhancedImages(
  supabase: SupabaseClient,
  originals: { bytes: Buffer; mime: string }[],
  urls: string[],
  hintName: string,
): Promise<SmartProductImage[]> {
  const images: SmartProductImage[] = [];

  // Generate at least 3 high-quality images overall, spreading them across
  // however many source photos were uploaded (capped at 6).
  const totalTarget = Math.min(6, Math.max(3, originals.length));
  const perImage = Math.max(1, Math.ceil(totalTarget / originals.length));

  for (let i = 0; i < originals.length; i += 1) {
    const original = originals[i]!;
    const originalUrl = urls[i]!;

    // Only attempt a few paid AI shots per photo (0 when generation is
    // disabled); the free deterministic framer below fills the rest of the
    // gallery so the total image count is unchanged.
    const aiWanted = Math.min(perImage, AI_MAX_STUDIO_SHOTS);
    let aiCovers: Buffer[] = [];
    if (aiWanted > 0) {
      try {
        aiCovers = await generateProductCoverShots({ ...original, title: hintName, count: aiWanted });
      } catch {
        aiCovers = [];
      }
    }
    for (const png of aiCovers) {
      const processedUrl = await uploadProcessedPng(supabase, png);
      images.push({
        originalUrl,
        processedUrl,
        blurHash: await generateBlurHashFromBuffer(png),
        source: "ai-generated",
        sourceLabel: "cover",
      });
    }

    const deterministicCount = Math.max(0, perImage - aiCovers.length);
    let framings: Buffer[] = [];
    if (deterministicCount > 0) {
      try {
        framings = await buildProductPhotoFramings(original.bytes, deterministicCount);
      } catch {
        framings = [];
      }
    }
    if (framings.length === 0 && aiCovers.length === 0) {
      images.push({
        originalUrl,
        processedUrl: originalUrl,
        blurHash: await generateBlurHashFromBuffer(Buffer.from(original.bytes)),
        source: "upload",
      });
      continue;
    }
    for (const png of framings) {
      const processedUrl = await uploadProcessedPng(supabase, png);
      images.push({
        originalUrl,
        processedUrl,
        blurHash: await generateBlurHashFromBuffer(Buffer.from(png)),
        source: "upload",
      });
    }
  }

  return images;
}

/**
 * Best-effort: when only one photo was uploaded, ask AI to generate 1-2
 * brand-new supplementary shots (contents poured/placed next to the
 * package, close-up of contents) so the gallery isn't just one flat pack
 * shot. These never redraw the real package's printed text, but the admin
 * should still verify they actually match the product.
 */
async function generateContextShots(
  supabase: SupabaseClient,
  original: { bytes: Buffer; mime: string },
  originalUrl: string,
): Promise<SmartProductImage[]> {
  const shots = await generateProductContextShots({
    ...original,
    count: MAX_AI_CONTEXT_SHOTS,
  }).catch(() => []);

  const images: SmartProductImage[] = [];
  for (const png of shots) {
    try {
      const processedUrl = await uploadProcessedPng(supabase, png);
      images.push({
        originalUrl,
        processedUrl,
        blurHash: await generateBlurHashFromBuffer(png),
        source: "ai-generated",
      });
    } catch {
      // skip on storage failure
    }
  }
  return images;
}

/** Best-effort: find extra real photos of the same product on the web (admin should verify each). */
async function findWebImages(
  supabase: SupabaseClient,
  query: string,
): Promise<SmartProductImage[]> {
  if (!query.trim()) return [];
  const candidates = await searchProductImagesWithOpenAi({ query, count: MAX_WEB_IMAGES }).catch(
    () => [],
  );

  const found: SmartProductImage[] = [];
  for (const candidate of candidates) {
    if (found.length >= MAX_WEB_IMAGES) break;
    const validated = await fetchAndValidateWebImage(candidate.url);
    if (!validated) continue;
    try {
      const processedUrl = await uploadWebImage(supabase, validated.bytes, validated.mime);
      found.push({
        originalUrl: candidate.url,
        processedUrl,
        blurHash: await generateBlurHashFromBuffer(validated.bytes),
        source: "web",
        sourceLabel: candidate.source,
      });
    } catch {
      // skip on storage failure
    }
  }
  return found;
}

/**
 * Queue a new product for background AI generation. Inserts a visible
 * placeholder row immediately (price 0, stock 0, generation_status
 * "pending") and returns its id right away — the actual photo enhancement,
 * name/description/specification drafting, and image gallery are built
 * afterwards via `after()` so the admin's request doesn't block on it. The
 * admin who queued it gets an admin_notifications row when it finishes (or
 * fails), and the product list shows a "generating" badge in the meantime.
 */
export async function createQueuedSmartProductAction(input: {
  imageUrls: string[];
  hintName: string;
  categoryId?: string;
  categoryName?: string;
  categories: { id: string; name: string }[];
}): Promise<
  | { success: true; data: { id: string } }
  | { success: false; error: string }
> {
  try {
    const { supabase, user } = await requireAdmin();
    const hintName = input.hintName.trim();
    const urls = input.imageUrls.map((url) => url.trim()).filter(Boolean).slice(0, 6);

    if (!hintName) {
      return {
        success: false as const,
        error: await actionErrorMessage("errors.smartProductNameRequired", new Error("name required")),
      };
    }
    if (urls.length === 0) {
      return {
        success: false as const,
        error: await actionErrorMessage("errors.smartProductNoImages", new Error("no images")),
      };
    }

    const slug = `${slugifyProductName(hintName)}-${Math.random().toString(36).slice(2, 8)}`;
    const { data: created, error: insertError } = await supabase
      .from("products")
      .insert({
        name: hintName,
        name_fa: hintName,
        slug,
        price: 0,
        stock: 0,
        image_url: urls[0],
        is_active: false,
        category_id: input.categoryId ?? null,
        generation_status: "pending",
      })
      .select("id")
      .single();
    if (insertError) throw insertError;

    const productId = created.id as string;
    const recipientId = user.id;
    const { categoryId, categoryName, categories } = input;

    after(() =>
      runQueuedProductGeneration({
        productId,
        urls,
        hintName,
        recipientId,
        categoryId,
        categoryName,
        categories,
      }),
    );

    return { success: true as const, data: { id: productId } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.smartProductFailed", err),
    };
  }
}

async function notifyGenerationResult(
  supabase: SupabaseClient,
  input: {
    recipientId: string;
    productId: string;
    type: "product_generated" | "product_generation_failed";
    title: string;
    body: string;
  },
) {
  try {
    await supabase.from("admin_notifications").insert({
      recipient_id: input.recipientId,
      type: input.type,
      title: input.title,
      body: input.body,
      product_id: input.productId,
    });
  } catch {
    /* never let a notification failure mask the real generation result */
  }
}

async function runQueuedProductGeneration(input: {
  productId: string;
  urls: string[];
  hintName: string;
  recipientId: string;
  categoryId?: string;
  categoryName?: string;
  categories: { id: string; name: string }[];
}) {
  const supabase = createServiceRoleClient();

  // One clear line in the Vercel function log so it's obvious what the AI
  // config actually resolved to at runtime (env vars not redeployed is the
  // usual reason "AI generation did nothing").
  console.log(
    `[smart-product] AI image gen: ${AI_IMAGE_GENERATION_ENABLED ? "ON" : "OFF"} | ` +
      `provider=${AI_IMAGE_PROVIDER} model=${AI_IMAGE_MODEL} | ` +
      `gemini key=${getGeminiApiKey() ? "yes" : "no"} openai key=${getOpenAiApiKey() ? "yes" : "no"} | ` +
      `web search=${AI_WEB_IMAGE_SEARCH_ENABLED ? "ON" : "OFF"} | ` +
      `studio shots=${AI_MAX_STUDIO_SHOTS} context shots=${AI_MAX_CONTEXT_SHOTS}`,
  );

  try {
    await supabase
      .from("products")
      .update({ generation_status: "generating" })
      .eq("id", input.productId);

    const originals = await Promise.all(input.urls.map(fetchImage));

    const [enhancedImages, catalog] = await Promise.all([
      buildEnhancedImages(supabase, originals, input.urls, input.hintName),
      draftCatalogFromImages({
        images: originals.map((item) => ({ mime: item.mime, bytes: item.bytes })),
        hintName: input.hintName,
        categoryName: input.categoryName,
        categories: input.categories,
      }),
    ]);

    const images = [...enhancedImages];

    if (originals.length === 1 && images.length < MAX_DRAFT_IMAGES) {
      const contextShots = await generateContextShots(supabase, originals[0]!, input.urls[0]!);
      images.push(...contextShots.slice(0, Math.max(0, MAX_DRAFT_IMAGES - images.length)));
    }

    if (AI_WEB_IMAGE_SEARCH_ENABLED && catalog.usedModel && images.length < MAX_DRAFT_IMAGES) {
      const query = [catalog.name_en, catalog.name_fa].filter(Boolean).join(" ");
      const webImages = await findWebImages(supabase, query);
      images.push(...webImages.slice(0, Math.max(0, MAX_DRAFT_IMAGES - images.length)));
    }

    const aiCount = images.filter((i) => i.source === "ai-generated").length;
    const webCount = images.filter((i) => i.source === "web").length;
    console.log(
      `[smart-product] ${input.hintName}: ${images.length} images ` +
        `(${aiCount} ai, ${webCount} web, ${images.length - aiCount - webCount} deterministic)` +
        `${AI_IMAGE_GENERATION_ENABLED && aiCount === 0 ? " — AI was ON but produced 0; check earlier [image-edit] logs" : ""}`,
    );

    const categoryId =
      input.categoryId || matchCategoryId(catalog.suggestedCategoryName, input.categories);
    const imageInputs: ProductImageInput[] = images.map((image) => ({
      image_url: image.processedUrl,
      blur_hash: image.blurHash,
    }));
    const cover = coverFromImageInputs(imageInputs);

    // AI-generated and web-sourced images carry a real accuracy risk (label
    // text or product match isn't guaranteed) — never auto-publish those;
    // require an admin to review and activate the product manually. When AI
    // generation is switched on at all, force review even if it silently fell
    // back to the deterministic framer, so the admin always gets a look.
    const needsReview =
      AI_IMAGE_GENERATION_ENABLED || images.some((image) => image.source !== "upload");

    const { error: updateError } = await supabase
      .from("products")
      .update({
        name_fa: catalog.name_fa,
        name_ar: catalog.name_ar,
        name_en: catalog.name_en,
        name: catalog.name_fa,
        description_fa: catalog.description_fa,
        description_ar: catalog.description_ar,
        description_en: catalog.description_en,
        description: catalog.description_fa,
        category_id: categoryId ?? null,
        image_url: cover.image_url ?? input.urls[0],
        blur_hash: cover.blur_hash,
        is_active: !needsReview,
        generation_status: "completed",
        generation_error: null,
      })
      .eq("id", input.productId);
    if (updateError) throw updateError;

    await syncProductFeatures(supabase, input.productId, catalog.features);
    await syncProductImages(supabase, input.productId, imageInputs);

    await notifyGenerationResult(supabase, {
      recipientId: input.recipientId,
      productId: input.productId,
      type: "product_generated",
      title: `محصول آماده شد: ${catalog.name_fa}`,
      body: needsReview
        ? "محتوا تولید شد، اما چون شامل تصاویر ساخته‌شده با AI است، قبل از نمایش در فروشگاه باید تصاویر را بررسی و محصول را فعال کنید."
        : "محتوا و گالری تصاویر این محصول با موفقیت تولید شد و آماده بررسی است.",
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    try {
      await supabase
        .from("products")
        .update({ generation_status: "failed", generation_error: message.slice(0, 500) })
        .eq("id", input.productId);
    } catch {
      /* nothing more we can do here */
    }
    await notifyGenerationResult(supabase, {
      recipientId: input.recipientId,
      productId: input.productId,
      type: "product_generation_failed",
      title: `تولید محتوا برای «${input.hintName}» ناموفق بود`,
      body: message.slice(0, 300),
    });
  }
}

/**
 * Re-enhance a single existing gallery image. When a product title is given,
 * tries the premium AI studio cover shot first (the admin sees the result
 * inline in the gallery and must still hit Save, so there's a human review
 * moment before it's persisted); otherwise, and on any AI failure, falls
 * back to the deterministic, pixel-safe enhancer.
 */
export async function enhanceProductImageAction(imageUrl: string, title?: string) {
  try {
    const { supabase } = await requireAdmin();
    const original = await fetchImage(imageUrl);

    let output: Buffer | null = null;
    if (title?.trim()) {
      try {
        const [cover] = await generateProductCoverShots({ ...original, title, count: 1 });
        output = cover ?? null;
      } catch {
        output = null;
      }
    }
    if (!output) {
      output = await enhanceProductPhoto(original.bytes);
    }

    const url = await uploadProcessedPng(supabase, output);
    const blurHash = await generateBlurHashFromBuffer(Buffer.from(output));
    return { success: true as const, data: { url, blurHash } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiImageFailed", err),
    };
  }
}
