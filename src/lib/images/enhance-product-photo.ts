import sharp from "sharp";
import { removeStudioBackground } from "@/lib/images/remove-studio-background";

const CANVAS_SIZE = 1200;
// Fraction of the canvas kept empty on each side around the product — this
// is what keeps the product from filling the whole frame edge-to-edge.
const PADDING_RATIO = 0.16;
// Light warm-gray studio backdrop, matching the store's catalog photography.
const STUDIO_BACKGROUND = { r: 238, g: 238, b: 238, alpha: 1 } as const;
// Zoom levels for successive framings: 1 = full product with generous
// padding, >1 = progressively closer detail shots of the same real photo.
const ZOOM_LEVELS = [1, 1.3, 1.65];

/**
 * Composite an already-cutout (transparent background) product photo onto a
 * consistent light-gray studio backdrop with a soft drop shadow beneath it,
 * matching the store's catalog photography style. Pure pixel compositing —
 * never regenerates the product itself, so it's as safe as a crop/resize.
 */
async function composeOnStudioBackground(cutout: Buffer, zoom: number): Promise<Buffer> {
  const meta = await sharp(cutout).metadata();
  const srcW = meta.width ?? CANVAS_SIZE;
  const srcH = meta.height ?? CANVAS_SIZE;

  let working = cutout;
  let workingW = srcW;
  let workingH = srcH;
  if (zoom > 1) {
    const cw = Math.max(1, Math.round(srcW / zoom));
    const ch = Math.max(1, Math.round(srcH / zoom));
    const left = Math.round((srcW - cw) / 2);
    const top = Math.round((srcH - ch) / 2);
    working = await sharp(cutout).extract({ left, top, width: cw, height: ch }).png().toBuffer();
    workingW = cw;
    workingH = ch;
  }

  const maxDim = Math.round(CANVAS_SIZE * (1 - PADDING_RATIO * 2));
  const scale = Math.min(maxDim / workingW, maxDim / workingH, 1);
  const productW = Math.max(1, Math.round(workingW * scale));
  const productH = Math.max(1, Math.round(workingH * scale));

  const product = await sharp(working)
    .resize(productW, productH, { fit: "inside" })
    .png()
    .toBuffer();

  const left = Math.round((CANVAS_SIZE - productW) / 2);
  const top = Math.round((CANVAS_SIZE - productH) / 2);
  const shadowOffset = Math.round(CANVAS_SIZE * 0.014);
  const shadowBlur = Math.max(6, Math.round(CANVAS_SIZE * 0.018));

  // Soft shadow: a pure-black silhouette shaped by the product's own alpha
  // channel (built via the alpha mask directly, never the product's actual
  // colors, so it can't pick up a color tint), blurred and offset slightly
  // down so only its soft edge peeks out from behind the product.
  const alphaMask = await sharp(product).ensureAlpha().extractChannel(3).blur(shadowBlur).toBuffer();
  const shadowShape = await sharp({
    create: { width: productW, height: productH, channels: 3, background: { r: 0, g: 0, b: 0 } },
  })
    .joinChannel(alphaMask)
    .png()
    .toBuffer();

  return sharp({
    create: { width: CANVAS_SIZE, height: CANVAS_SIZE, channels: 4, background: STUDIO_BACKGROUND },
  })
    .composite([
      { input: shadowShape, left, top: top + shadowOffset },
      { input: product, left, top },
    ])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

async function sharpenedCutout(bytes: Buffer): Promise<Buffer> {
  const cleaned = await removeStudioBackground(bytes);
  return sharp(cleaned)
    .sharpen({ sigma: 1 })
    .modulate({ brightness: 1.03, saturation: 1.05 })
    .normalise()
    .png()
    .toBuffer();
}

/**
 * Deterministic, pixel-safe product photo enhancement: crops to the
 * product, sharpens/normalizes it, then composites it onto the store's
 * standard light-gray studio backdrop with a soft shadow. This never
 * regenerates pixels the way a generative image model does, so printed
 * label text (Persian/Arabic/English) can never be hallucinated or
 * corrupted — only real photo adjustments (crop, sharpen, exposure,
 * background/shadow compositing) are applied.
 */
export async function enhanceProductPhoto(bytes: Buffer): Promise<Buffer> {
  const cutout = await sharpenedCutout(bytes);
  return composeOnStudioBackground(cutout, 1);
}

/**
 * Build up to `count` genuinely different, pixel-safe framings of the same
 * enhanced photo — a full shot with generous padding, then progressively
 * closer detail crops — all on the same consistent studio backdrop, so the
 * catalog gets real visual variety without ever altering the product or
 * its label, and without the product looking oversized or the shots
 * looking like near-duplicates of each other.
 */
export async function buildProductPhotoFramings(bytes: Buffer, count: number): Promise<Buffer[]> {
  const cutout = await sharpenedCutout(bytes);
  const levels = ZOOM_LEVELS.slice(0, Math.max(1, Math.min(count, ZOOM_LEVELS.length)));
  const framings: Buffer[] = [];
  for (const zoom of levels) {
    framings.push(await composeOnStudioBackground(cutout, zoom));
  }
  return framings;
}
