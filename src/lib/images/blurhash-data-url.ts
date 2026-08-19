import { decode } from "blurhash";
// @ts-expect-error upng-js has no types
import UPNG from "upng-js";

const BLUR_WIDTH = 32;
const BLUR_HEIGHT = 32;

const blurDataUrlCache = new Map<string, string>();

function rgbaToBase64Png(pixels: Uint8ClampedArray, width: number, height: number) {
  const png = UPNG.encode([pixels.buffer], width, height, 0);
  const bytes = new Uint8Array(png);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

/** Decode BlurHash to a PNG data URL for next/image blurDataURL (SSR + client safe). */
export function blurHashToDataURL(hash: string): string {
  const cached = blurDataUrlCache.get(hash);
  if (cached) return cached;

  const pixels = decode(hash, BLUR_WIDTH, BLUR_HEIGHT);
  const base64 = rgbaToBase64Png(pixels, BLUR_WIDTH, BLUR_HEIGHT);
  const dataUrl = `data:image/png;base64,${base64}`;
  blurDataUrlCache.set(hash, dataUrl);
  return dataUrl;
}

export function resolveBlurDataUrl(
  blurHash: string | null | undefined,
  fallback: string,
): string {
  if (!blurHash?.trim()) return fallback;
  try {
    return blurHashToDataURL(blurHash.trim());
  } catch {
    return fallback;
  }
}
