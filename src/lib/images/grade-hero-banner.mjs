// Deterministic (no AI, no tokens) colour grade for hero banner photos.
//
// Every banner is "groceries on a dark counter in front of a dark wall". The
// client's mock-up wants that wall to be the SAME near-black teal as the page
// (--bg-main #0c1217), so the banner melts into the site instead of reading as
// a grey/brown box. We (1) measure how dark the wall of this photo is, (2) pull
// the dark tones down to the mock-up's wall level with a smooth gain that fades
// out on bright pixels, and (3) tint what is still dark toward the page's teal.
// Gain is driven by max(R,G,B), so saturated produce (red tomatoes, oranges)
// counts as bright and keeps its colour.
import sharp from "sharp";

/** Measured from the client's mock-up banner (left wall behind the headline). */
export const BANNER_TARGET = {
  wall: 21, // max channel of the wall, mock-up #0a1215
  tint: [10 / 16.6, 18 / 16.6, 21 / 16.6], // wall colour / its luminance
  gainEnd: 150, // from this brightness (max channel) up, pixels are untouched
  tintStart: 30, // fully teal below this output brightness ...
  tintEnd: 95, // ... fading to the photo's own colour here
  tintAmount: 0.85,
};

const smooth = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

/**
 * @param {Buffer} input any image sharp can read
 * @returns {Promise<{ data: Buffer, info: import("sharp").OutputInfo, wallBefore: number }>}
 *   raw RGB of the graded image (encode it as you like)
 */
export async function gradeHeroBannerRaw(input) {
  const { data, info } = await sharp(input)
    .rotate()
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const n = info.width * info.height;

  // Wall level: the 35th percentile of brightness — the wall and the counter
  // cover well over a third of every banner, the groceries never do.
  const hist = new Uint32Array(256);
  for (let i = 0; i < n; i += 1) {
    hist[Math.max(data[i * 3], data[i * 3 + 1], data[i * 3 + 2])] += 1;
  }
  let acc = 0;
  let wall = 0;
  while (wall < 255 && acc + hist[wall] < n * 0.35) acc += hist[wall++];
  wall = Math.max(wall, 1);

  const T = BANNER_TARGET;
  // Gain at the wall must land exactly on T.wall: g(V) = k + (1 - k) * s(V).
  const sWall = smooth(0, T.gainEnd, wall);
  const k = Math.min(1, Math.max(0.2, (T.wall / wall - sWall) / (1 - sWall)));

  const out = Buffer.alloc(n * 3);
  for (let i = 0; i < n; i += 1) {
    const r = data[i * 3];
    const g = data[i * 3 + 1];
    const b = data[i * 3 + 2];
    const v = Math.max(r, g, b);
    const gain = k + (1 - k) * smooth(0, T.gainEnd, v);
    const r1 = r * gain;
    const g1 = g * gain;
    const b1 = b * gain;
    const lum = 0.2126 * r1 + 0.7152 * g1 + 0.0722 * b1;
    const t = T.tintAmount * (1 - smooth(T.tintStart, T.tintEnd, v * gain));
    out[i * 3] = Math.round(r1 + (lum * T.tint[0] - r1) * t);
    out[i * 3 + 1] = Math.round(g1 + (lum * T.tint[1] - g1) * t);
    out[i * 3 + 2] = Math.round(b1 + (lum * T.tint[2] - b1) * t);
  }
  return { data: out, info: { ...info, channels: 3 }, wallBefore: wall };
}

/**
 * @param {Buffer} input any image sharp can read
 * @returns {Promise<Buffer>} WebP, same size as the input
 */
export async function gradeHeroBanner(input) {
  const { data, info } = await gradeHeroBannerRaw(input);
  return sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } })
    .webp({ quality: 88 })
    .toBuffer();
}
