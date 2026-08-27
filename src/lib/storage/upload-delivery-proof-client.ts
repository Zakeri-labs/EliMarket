"use client";

import { createClient } from "@/core/supabase/client";

const BUCKET = "delivery-proofs";
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

/** Downscale a camera photo so proof uploads stay small. Falls back to the
 *  original file if the browser can't decode it (e.g. HEIC without support). */
async function downscale(file: File): Promise<Blob> {
  if (typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY),
    );
    return blob ?? file;
  } catch {
    return file;
  }
}

/** Upload a rider proof photo to the private `delivery-proofs` bucket.
 *  Returns only the storage path — the bucket is private, so viewers get a
 *  signed URL from `getDeliveryProofUrlAction`. */
export async function uploadDeliveryProof(
  file: File,
  orderId: string,
): Promise<{ path: string }> {
  const supabase = createClient();
  const body = await downscale(file);
  const isJpeg = body !== file || file.type === "image/jpeg";
  const ext = isJpeg ? "jpg" : (file.name.split(".").pop()?.toLowerCase() ?? "jpg");
  const path = `delivery/${orderId}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, body, {
    upsert: false,
    contentType: isJpeg ? "image/jpeg" : file.type || undefined,
  });
  if (error) throw error;

  return { path };
}
