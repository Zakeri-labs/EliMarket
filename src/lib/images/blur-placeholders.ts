import heroDefaultImage from "@/assets/images/hero-default.png";
import productThumbImage from "@/assets/images/product-thumb.png";

/** Build-time blur from static imports (sharp at compile time). */
export { heroDefaultImage, productThumbImage };

export const IMAGE_BLUR_DATA_URL =
  productThumbImage.blurDataURL ??
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

/** Paths stored in DB/mock that map to a static import. */
const STATIC_PATH_MAP: Record<string, typeof productThumbImage> = {
  "/icon.png": productThumbImage,
};

export function resolveStaticImagePath(path: string) {
  return STATIC_PATH_MAP[path] ?? null;
}

export function isRemoteImageSrc(src: string) {
  return src.startsWith("http://") || src.startsWith("https://");
}
