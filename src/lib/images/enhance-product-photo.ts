import sharp from "sharp";
import { removeStudioBackground } from "@/lib/images/remove-studio-background";

/**
 * Deterministic, pixel-safe product photo enhancement: crops to the product
 * and sharpens/normalizes it. This never regenerates pixels the way a
 * generative image model does, so printed label text (Persian/Arabic/
 * English) can never be hallucinated or corrupted — only real photo
 * adjustments (crop, sharpen, exposure) are applied.
 */
export async function enhanceProductPhoto(bytes: Buffer): Promise<Buffer> {
  const cleaned = await removeStudioBackground(bytes);
  return sharp(cleaned)
    .sharpen({ sigma: 1 })
    .modulate({ brightness: 1.03, saturation: 1.05 })
    .normalise()
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/**
 * Build up to `count` genuinely different, pixel-safe framings of the same
 * enhanced photo (full view, closer crop, soft backdrop) so the catalog
 * gets visual variety without ever altering the real product or its label.
 */
export async function buildProductPhotoFramings(bytes: Buffer, count: number): Promise<Buffer[]> {
  const enhanced = await enhanceProductPhoto(bytes);
  const framings: Buffer[] = [enhanced];
  if (count <= 1) return framings;

  const meta = await sharp(enhanced).metadata();
  const width = meta.width ?? 1200;
  const height = meta.height ?? 1200;

  // Tighter, centered crop — a "closer look" framing of the same photo.
  const zoom = 0.86;
  const cw = Math.max(1, Math.round(width * zoom));
  const ch = Math.max(1, Math.round(height * zoom));
  const left = Math.round((width - cw) / 2);
  const top = Math.round((height - ch) / 2);
  const tight = await sharp(enhanced)
    .extract({ left, top, width: cw, height: ch })
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toBuffer();
  framings.push(tight);
  if (count <= 2) return framings;

  // Same product composited over a soft light-gray backdrop instead of pure
  // white — only the background color changes, product pixels are untouched.
  try {
    const softBg = await sharp({
      create: { width, height, channels: 4, background: { r: 244, g: 244, b: 245, alpha: 1 } },
    })
      .composite([{ input: enhanced }])
      .png({ compressionLevel: 9 })
      .toBuffer();
    framings.push(softBg);
  } catch {
    // If compositing fails for any reason, just skip the third framing.
  }

  return framings.slice(0, count);
}
