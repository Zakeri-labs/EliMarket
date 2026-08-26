import sharp from "sharp";
import { generateBlurHashFromBuffer } from "@/lib/images/generate-blur-hash";

/** Square avatar target — large enough for retina UI, small on disk as WebP. */
export const AVATAR_SIZE = 512;
export const AVATAR_WEBP_QUALITY = 80;
/** Reject oversized originals before processing (bytes). */
export const AVATAR_MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);

export function isAllowedAvatarMime(type: string | undefined | null): boolean {
  if (!type) return false;
  return ALLOWED_TYPES.has(type.toLowerCase()) || type.toLowerCase().startsWith("image/");
}

/**
 * Resize to a square cover crop and encode as WebP for minimal storage size,
 * then derive a BlurHash from the optimized bytes.
 */
export async function optimizeAvatarImage(input: Buffer): Promise<{
  webp: Buffer;
  blurHash: string;
  width: number;
  height: number;
}> {
  const webp = await sharp(input)
    .rotate()
    .resize(AVATAR_SIZE, AVATAR_SIZE, {
      fit: "cover",
      position: "attention",
      withoutEnlargement: false,
    })
    .webp({ quality: AVATAR_WEBP_QUALITY, effort: 4 })
    .toBuffer();

  const blurHash = await generateBlurHashFromBuffer(webp);
  return { webp, blurHash, width: AVATAR_SIZE, height: AVATAR_SIZE };
}
