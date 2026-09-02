import sharp from "sharp";

const CANVAS_SIZE = 1200;
// White in the source photo lands on this grey — a clearly grey studio sweep.
const BG = 207;
// Luma below this is left untouched, so the product's mid/shadow tones — and
// the photo's own real contact shadow — are preserved; only the bright sweep
// is pulled down to grey.
const KNEE = 172;
// Product box vs canvas at zoom 1; >1 = progressively closer detail crops.
const INNER_RATIO = 0.9;
const ZOOM_LEVELS = [1, 1.28, 1.6];

/** input luma -> multiplier that maps white toward BG, hue preserved. */
function toneCurve(): Float64Array {
  const lut = new Float64Array(256);
  for (let L = 0; L < 256; L += 1) {
    lut[L] = L <= KNEE ? 1 : (KNEE + ((L - KNEE) * (BG - KNEE)) / (255 - KNEE)) / L;
  }
  return lut;
}

/** Radial "studio lighting" — brighter behind the product, falling off to the
 *  corners. Applied over the whole frame so it can never leave a seam. */
function studioLightOverlay(size: number): Buffer {
  return Buffer.from(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs><radialGradient id="l" cx="50%" cy="41%" r="75%">` +
      `<stop offset="0%" stop-color="#000" stop-opacity="0"/>` +
      `<stop offset="50%" stop-color="#000" stop-opacity="0.02"/>` +
      `<stop offset="100%" stop-color="#000" stop-opacity="0.17"/>` +
      `</radialGradient></defs>` +
      `<rect width="${size}" height="${size}" fill="url(#l)"/></svg>`,
  );
}

/**
 * Tone-map the real photo so its white sweep + own soft shadow roll into one
 * grey, centre it on the canvas, and lay a radial studio-light gradient over
 * everything. Optionally crop tighter first for a detail framing.
 *
 * Pure per-pixel curve + compositing — the product's own pixels (shape,
 * colour, label text in every script) are never regenerated, only its bright
 * highlights are gently compressed. So it is as safe as a crop/resize and can
 * be auto-published, unlike a generative model's output.
 */
async function studioize(bytes: Buffer, zoom = 1): Promise<Buffer> {
  const src = sharp(bytes).rotate();
  const { data, info } = await src.clone().removeAlpha().raw().toBuffer({ resolveWithObject: true });

  const px = Buffer.from(data);
  const lut = toneCurve();
  for (let i = 0; i < px.length; i += 3) {
    const L = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2];
    const f = lut[Math.round(L)]!;
    if (f === 1) continue;
    px[i] = Math.min(255, Math.round(px[i] * f));
    px[i + 1] = Math.min(255, Math.round(px[i + 1] * f));
    px[i + 2] = Math.min(255, Math.round(px[i + 2] * f));
  }

  let toned = sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } });
  if (zoom > 1) {
    const cw = Math.max(1, Math.round(info.width / zoom));
    const ch = Math.max(1, Math.round(info.height / zoom));
    toned = toned.extract({
      left: Math.round((info.width - cw) / 2),
      top: Math.round((info.height - ch) / 2),
      width: cw,
      height: ch,
    });
  }

  const inner = Math.round(CANVAS_SIZE * INNER_RATIO);
  const margin = CANVAS_SIZE - inner;
  const grey = { r: BG, g: BG, b: BG + 1 };
  const framed = await toned
    .resize(inner, inner, { fit: "contain", background: grey })
    .extend({
      top: margin >> 1,
      bottom: margin - (margin >> 1),
      left: margin >> 1,
      right: margin - (margin >> 1),
      background: grey,
    })
    .modulate({ saturation: 1.06 })
    .linear(1.06, -8)
    .png()
    .toBuffer();

  return sharp(framed)
    .composite([{ input: studioLightOverlay(CANVAS_SIZE) }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** Single studio cover shot from a real product photo. */
export async function enhanceProductPhoto(bytes: Buffer): Promise<Buffer> {
  return studioize(bytes, 1);
}

/**
 * Up to `count` framings of the same photo — a full shot, then progressively
 * closer detail crops — all on the identical studio backdrop, so the gallery
 * gets real variety without ever altering the product or its label.
 */
export async function buildProductPhotoFramings(bytes: Buffer, count: number): Promise<Buffer[]> {
  const levels = ZOOM_LEVELS.slice(0, Math.max(1, Math.min(count, ZOOM_LEVELS.length)));
  const out: Buffer[] = [];
  for (const zoom of levels) out.push(await studioize(bytes, zoom));
  return out;
}
