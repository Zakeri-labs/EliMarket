"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { generateBlurHashFromBuffer } from "@/lib/images/generate-blur-hash";
import { removeStudioBackground } from "@/lib/images/remove-studio-background";
import {
  draftCatalogFromImages,
  matchCategoryId,
} from "@/lib/ai/vision-catalog";
import type { ProductFeatureInput } from "@/app/_types/database.types";

export type SmartProductImage = {
  originalUrl: string;
  processedUrl: string;
  blurHash: string;
};

export type SmartProductDraft = {
  images: SmartProductImage[];
  name: string;
  slug: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  features: ProductFeatureInput[];
  suggestedCategoryId?: string;
  usedVisionModel: boolean;
};

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

async function uploadProcessedPng(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  png: Buffer,
) {
  const path = `products/ai/${Date.now()}-${Math.random().toString(36).slice(2)}.png`;
  const { error } = await supabase.storage.from("product-images").upload(path, png, {
    contentType: "image/png",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
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
    const images: SmartProductImage[] = [];

    for (let i = 0; i < originals.length; i += 1) {
      const original = originals[i]!;
      const originalUrl = urls[i]!;
      let processedUrl = originalUrl;
      let blurSource: Buffer = Buffer.from(original.bytes);
      try {
        const png = await removeStudioBackground(original.bytes);
        processedUrl = await uploadProcessedPng(supabase, png);
        blurSource = Buffer.from(png);
      } catch {
        processedUrl = originalUrl;
      }
      images.push({
        originalUrl,
        processedUrl,
        blurHash: await generateBlurHashFromBuffer(blurSource),
      });
    }

    const catalog = await draftCatalogFromImages({
      images: originals.map((item) => ({ mime: item.mime, bytes: item.bytes })),
      hintName: input.hintName,
      categoryName: input.categoryName,
      categories: input.categories,
    });

    return {
      success: true as const,
      data: {
        images,
        name: catalog.name,
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
    const png = await removeStudioBackground(original.bytes);
    const url = await uploadProcessedPng(supabase, png);
    const blurHash = await generateBlurHashFromBuffer(Buffer.from(png));
    return { success: true as const, data: { url, blurHash } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.aiImageFailed", err),
    };
  }
}
