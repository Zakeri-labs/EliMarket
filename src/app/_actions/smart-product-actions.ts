"use server";

import sharp from "sharp";
import { requireAdmin } from "@/core/supabase/auth-helpers";
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
import type { ProductFeatureInput } from "@/app/_types/database.types";

type AdminSupabase = Awaited<ReturnType<typeof requireAdmin>>["supabase"];

export type SmartProductImage = {
  originalUrl: string;
  processedUrl: string;
  blurHash: string;
  source: "upload" | "web" | "ai-generated";
  sourceLabel?: string;
};

export type SmartProductDraft = {
  images: SmartProductImage[];
  name_fa: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  features: ProductFeatureInput[];
  suggestedCategoryId?: string;
  usedVisionModel: boolean;
};

const MAX_DRAFT_IMAGES = 8;
const MAX_WEB_IMAGES = 3;
const MAX_AI_CONTEXT_SHOTS = 2;

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

async function uploadProcessedPng(supabase: AdminSupabase, png: Buffer) {
  const path = `products/ai/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { error } = await supabase.storage.from("product-images").upload(path, png, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

async function uploadWebImage(supabase: AdminSupabase, bytes: Buffer, mime: string) {
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

async function buildEnhancedImages(
  supabase: AdminSupabase,
  originals: { bytes: Buffer; mime: string }[],
  urls: string[],
): Promise<SmartProductImage[]> {
  const images: SmartProductImage[] = [];

  // Generate at least 3 high-quality catalog framings overall, spreading
  // them across however many source photos were uploaded (capped at 6).
  // These are deterministic crop/background framings of the real photo —
  // never AI-regenerated pixels — so label text can never be corrupted.
  const totalTarget = Math.min(6, Math.max(3, originals.length));
  const framingsPerImage = Math.max(1, Math.ceil(totalTarget / originals.length));

  for (let i = 0; i < originals.length; i += 1) {
    const original = originals[i]!;
    const originalUrl = urls[i]!;
    let framings: Buffer[] = [];
    try {
      framings = await buildProductPhotoFramings(original.bytes, framingsPerImage);
    } catch {
      framings = [];
    }
    if (framings.length === 0) {
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
  supabase: AdminSupabase,
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
  supabase: AdminSupabase,
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

export async function processSmartProductDraftAction(input: {
  imageUrls: string[];
  hintName?: string;
  categoryId?: string;
  categoryName?: string;
  categories: { id: string; name: string }[];
}): Promise<
  | { success: true; data: SmartProductDraft }
  | { success: false; error: string }
> {
  try {
    const { supabase } = await requireAdmin();
    const urls = input.imageUrls.map((url) => url.trim()).filter(Boolean).slice(0, 6);
    if (urls.length === 0) {
      return {
        success: false as const,
        error: await actionErrorMessage("errors.smartProductNoImages", new Error("no images")),
      };
    }

    const originals = await Promise.all(urls.map(fetchImage));

    const [enhancedImages, catalog] = await Promise.all([
      buildEnhancedImages(supabase, originals, urls),
      draftCatalogFromImages({
        images: originals.map((item) => ({ mime: item.mime, bytes: item.bytes })),
        hintName: input.hintName,
        categoryName: input.categoryName,
        categories: input.categories,
      }),
    ]);

    const images = [...enhancedImages];

    // Only one photo uploaded — ask AI to fill out the gallery with a couple
    // of supplementary shots (contents poured out, close-up of contents).
    if (originals.length === 1 && images.length < MAX_DRAFT_IMAGES) {
      const contextShots = await generateContextShots(supabase, originals[0]!, urls[0]!);
      images.push(...contextShots.slice(0, Math.max(0, MAX_DRAFT_IMAGES - images.length)));
    }

    if (catalog.usedModel && images.length < MAX_DRAFT_IMAGES) {
      const query = [catalog.name_en, catalog.name_fa].filter(Boolean).join(" ");
      const webImages = await findWebImages(supabase, query);
      images.push(...webImages.slice(0, Math.max(0, MAX_DRAFT_IMAGES - images.length)));
    }

    return {
      success: true as const,
      data: {
        images,
        name_fa: catalog.name_fa,
        name_ar: catalog.name_ar,
        name_en: catalog.name_en,
        slug: catalog.slug,
        description_fa: catalog.description_fa,
        description_ar: catalog.description_ar,
        description_en: catalog.description_en,
        features: catalog.features,
        suggestedCategoryId:
          input.categoryId ||
          matchCategoryId(catalog.suggestedCategoryName, input.categories),
        usedVisionModel: catalog.usedModel,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.smartProductFailed", err),
    };
  }
}

export async function enhanceProductImageAction(imageUrl: string) {
  try {
    const { supabase } = await requireAdmin();
    const original = await fetchImage(imageUrl);
    const output = await enhanceProductPhoto(original.bytes);

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
