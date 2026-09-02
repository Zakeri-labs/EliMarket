"use client";

import { createClient } from "@/core/supabase/client";

export type ImageStorageFolder =
  | "hero"
  | "products"
  | "categories"
  | "brands"
  | "blog";

/** Upload large files directly to Supabase Storage (bypasses Server Action body limit). */
export async function uploadImageFileToStorage(
  file: File,
  folder: ImageStorageFolder,
) {
  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, {
      upsert: false,
      contentType: file.type || undefined,
    });

  if (error) throw error;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { path, url: data.publicUrl };
}
