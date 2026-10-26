// Deterministic (no AI, no tokens) backdrop swap for studio product photos.
//
// Idea: every studio shot is "product on a smooth grey sweep + its own soft
// shadow". We (1) fit a smooth model B(x,y) of the old backdrop from the pixels
// that look like backdrop, (2) mark pixels that clearly belong to the product,
// and (3) re-light everything that is NOT product by the ratio newBackdrop/B.
// Backdrop pixels become the new backdrop exactly; the photo's own contact
// shadow keeps its relative darkness; product pixels are left byte-identical,
// so labels, text and colours cannot be altered.
import sharp from "sharp";

/**
 * Target look, measured from the client's mock-up product cards: a mid-dark
 * grey at the top that opens up into a light studio grey toward the bottom
 * (the card text sits on the light part). The bottom stop equals the card's
 * name/price band (#dcdbda), so the photo fades into it without a step.
 * `stops` are [y 0..1, grey level]; `tint` is the mock-up's faint warmth as
 * [y 0..1, red offset, blue offset] around that level.
 */
export const TARGET = {
  stops: [
    [0, 104],
    [0.45, 136],
    [0.65, 156],
    [0.8, 192],
    [0.9, 212],
    // The card shows the square photo at 10:9 (object-cover crops 5% off the
    // bottom), so the band colour must already be reached by y = 0.95.
    [0.95, 219],
    [1, 219],
  ],
  tint: [
    [0, 4, -3],
    [0.6, 5, -2],
    [1, 1, -1],
  ],
  glow: 6, // extra brightness of the soft light pool behind the product
  corner: 4, // corner fall-off
};

function gradientAt(y) {
  const s = TARGET.stops;
  if (y <= s[0][0]) return s[0][1];
  for (let i = 1; i < s.length; i += 1) {
    if (y <= s[i][0]) {
      const t = (y - s[i - 1][0]) / (s[i][0] - s[i - 1][0]);
      return s[i - 1][1] + (s[i][1] - s[i - 1][1]) * t;
    }
  }
  return s[s.length - 1][1];
}

/** Per-channel gain that turns the neutral level `base` into the warm grey. */
function tintAt(y, base) {
  const s = TARGET.tint;
  let i = 1;
  while (i < s.length - 1 && y > s[i][0]) i += 1;
  const t = Math.min(Math.max((y - s[i - 1][0]) / (s[i][0] - s[i - 1][0]), 0), 1);
  const r = s[i - 1][1] + (s[i][1] - s[i - 1][1]) * t;
  const b = s[i - 1][2] + (s[i][2] - s[i - 1][2]) * t;
  return [(base + r) / base, 1, (base + b) / base];
}

const WORK = 1024;
const G = 48; // fitting grid

function targetBackdrop(x, y) {
  const u = x * 2 - 1;
  const v = y * 2 - 1;
  const base = gradientAt(y);
  const glow = TARGET.glow * Math.exp(-((u * u) / 0.5 + ((y - 0.45) * (y - 0.45)) / 0.18));
  const corner = TARGET.corner * Math.pow((u * u + v * v) / 2, 1.5);
  return base + glow - corner;
}

/**
 * Smooth backdrop model: cells flagged `fixed` keep their measured value, every
 * other cell (product, shadow) is filled by diffusion from its neighbours.
 */
function diffuse(grid, fixed) {
  const out = Float64Array.from(grid);
  // Seed unknown cells with the mean of the known ones so diffusion converges fast.
  let sum = 0;
  let n = 0;
  for (let i = 0; i < out.length; i += 1) if (fixed[i]) { sum += out[i]; n += 1; }
  const mean = n ? sum / n : 128;
  for (let i = 0; i < out.length; i += 1) if (!fixed[i]) out[i] = mean;
  let cur = out;
  let nxt = new Float64Array(out.length);
  for (let it = 0; it < 900; it += 1) {
    for (let gy = 0; gy < G; gy += 1) {
      for (let gx = 0; gx < G; gx += 1) {
        const i = gy * G + gx;
        if (fixed[i]) { nxt[i] = grid[i]; continue; }
        const l = cur[gy * G + Math.max(gx - 1, 0)];
        const r = cur[gy * G + Math.min(gx + 1, G - 1)];
        const u = cur[Math.max(gy - 1, 0) * G + gx];
        const d = cur[Math.min(gy + 1, G - 1) * G + gx];
        nxt[i] = (l + r + u + d) / 4;
      }
    }
    [cur, nxt] = [nxt, cur];
  }
  return cur;
}

/** Bilinear lookup in a G x G grid at normalised (x, y). */
function sample(grid, x, y) {
  const fx = Math.min(Math.max(x, 0), 1) * (G - 1);
  const fy = Math.min(Math.max(y, 0), 1) * (G - 1);
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const x1 = Math.min(x0 + 1, G - 1);
  const y1 = Math.min(y0 + 1, G - 1);
  const tx = fx - x0;
  const ty = fy - y0;
  const top = grid[y0 * G + x0] * (1 - tx) + grid[y0 * G + x1] * tx;
  const bot = grid[y1 * G + x0] * (1 - tx) + grid[y1 * G + x1] * tx;
  return top * (1 - ty) + bot * ty;
}

/**
 * @param {Buffer} input any image sharp can read
 * @returns {Promise<Buffer>} square PNG
 */
export async function relightBackdrop(input) {
  const { data, info } = await sharp(input)
    .rotate()
    .removeAlpha()
    .resize(WORK, WORK, { fit: "contain", background: { r: 205, g: 205, b: 205 } })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;

  // Coarse grid for fitting.
  const small = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
    .resize(G, G, { kernel: "linear" })
    .raw()
    .toBuffer();
  const grid = [0, 1, 2].map((c) => Float64Array.from({ length: G * G }, (_, i) => small[i * 3 + c]));

  // Start from the border ring, then grow to every cell that agrees with the model.
  let fixed = new Uint8Array(G * G);
  const ring = 2;
  for (let gy = 0; gy < G; gy += 1)
    for (let gx = 0; gx < G; gx += 1)
      if (gx < ring || gy < ring || gx >= G - ring || gy >= G - ring) fixed[gy * G + gx] = 1;

  let model = [0, 1, 2].map((c) => diffuse(grid[c], fixed));
  for (let iter = 0; iter < 5; iter += 1) {
    const next = new Uint8Array(G * G);
    let count = 0;
    for (let i = 0; i < G * G; i += 1) {
      const r = [0, 1, 2].map((c) => grid[c][i] / Math.max(model[c][i], 1));
      const mean = (r[0] + r[1] + r[2]) / 3;
      const spread = Math.max(...r) - Math.min(...r);
      if (spread < 0.05 && mean > 0.965 && mean < 1.035) {
        next[i] = 1;
        count += 1;
      }
    }
    if (count < G * 3) break;
    fixed = next;
    model = [0, 1, 2].map((c) => diffuse(grid[c], fixed));
  }

  // Full-resolution backdrop model.
  const bgRgb = new Float32Array(W * H * 3);
  const stray = new Uint8Array(W * H); // colourful or very dark pixels: surely product
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const nx = x / (W - 1);
      const ny = y / (H - 1);
      const i = y * W + x;
      const bg = model.map((m) => Math.max(sample(m, nx, ny), 8));
      bgRgb[i * 3] = bg[0];
      bgRgb[i * 3 + 1] = bg[1];
      bgRgb[i * 3 + 2] = bg[2];
      const r = [data[i * 3] / bg[0], data[i * 3 + 1] / bg[1], data[i * 3 + 2] / bg[2]];
      const mean = (r[0] + r[1] + r[2]) / 3;
      const spread = Math.max(...r) - Math.min(...r);
      // colourful, much brighter than the sweep (white product), or near-black
      stray[i] = spread > 0.13 || mean > 1.12 || mean < 0.3 ? 1 : 0;
    }
  }

  // Product mask by connectivity: the backdrop is whatever can be reached from
  // the image border WITHOUT crossing a strong edge. Everything enclosed by a
  // silhouette (white eggs, a shaded milk bottle, glossy packs) is product even
  // when its brightness is close to the backdrop's.
  const { data: lumSoft, info: lInfo } = await sharp(data, { raw: { width: W, height: H, channels: 3 } })
    .greyscale()
    .blur(1.0)
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const ls = lInfo.channels;
  const barrier = new Uint8Array(W * H);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * W + x;
      const xl = lumSoft[(y * W + Math.max(x - 1, 0)) * ls];
      const xr = lumSoft[(y * W + Math.min(x + 1, W - 1)) * ls];
      const yu = lumSoft[(Math.max(y - 1, 0) * W + x) * ls];
      const yd = lumSoft[(Math.min(y + 1, H - 1) * W + x) * ls];
      const grad = Math.abs(xr - xl) + Math.abs(yd - yu);
      barrier[i] = grad > 5 || stray[i] ? 1 : 0;
    }
  }
  const reached = new Uint8Array(W * H);
  const stack = [];
  const push = (x, y) => {
    const i = y * W + x;
    if (!reached[i] && !barrier[i]) {
      reached[i] = 1;
      stack.push(i);
    }
  };
  for (let x = 0; x < W; x += 1) {
    push(x, 0);
    push(x, H - 1);
  }
  for (let y = 0; y < H; y += 1) {
    push(0, y);
    push(W - 1, y);
  }
  while (stack.length) {
    const i = stack.pop();
    const x = i % W;
    const y = (i - x) / W;
    if (x > 0) push(x - 1, y);
    if (x < W - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < H - 1) push(x, y + 1);
  }
  // Soft contact shadows have enough texture to raise barriers, so patches of
  // them end up enclosed and would keep the OLD backdrop's grey — visible as
  // dark speckles/blotches beside the product. A pixel darker than the sweep
  // (but not near-black) that keeps the sweep's own colour balance is shadow:
  // relight it with the backdrop (softly, by how far its colour drifts from
  // the sweep's, so there is no hard edge).
  // Shadows tinted by the product's bounce light (yellow under bananas) are
  // too colourful for that, so they stay "product" — but they still get
  // `lift`: the same brightening as the backdrop around them, keeping their
  // own colour, fading out for saturated or near-black (real product) pixels.
  const smooth = (a, b, v) => {
    const t = Math.min(Math.max((v - a) / (b - a), 0), 1);
    return t * t * (3 - 2 * t);
  };
  const mask = new Uint8Array(W * H);
  const lift = new Uint8Array(W * H);
  for (let i = 0; i < mask.length; i += 1) {
    if (reached[i]) continue;
    const r = [0, 1, 2].map((c) => data[i * 3 + c] / bgRgb[i * 3 + c]);
    const mean = (r[0] + r[1] + r[2]) / 3;
    const spread = Math.max(...r) - Math.min(...r);
    let shadow = 0;
    if (mean > 0.3 && mean < 1.02) {
      // measured: floor shadow ~0.03-0.04, a cream bottle's shaded edge ~0.09
      shadow = 1 - smooth(0.05, 0.08, spread);
    }
    mask[i] = Math.round(255 * (1 - shadow));
    lift[i] = Math.round(
      255 * (1 - smooth(0.05, 0.3, spread)) * smooth(0.1, 0.3, mean) * (1 - smooth(0.95, 1.05, mean)),
    );
  }
  const liftSoft = await sharp(Buffer.from(lift), { raw: { width: W, height: H, channels: 1 } })
    .blur(1.5)
    .toColourspace("b-w")
    .raw()
    .toBuffer();

  // Shrink by a pixel (drops the edge band) and soften slightly.
  const { data: grown, info: gInfo } = await sharp(Buffer.from(mask), {
    raw: { width: W, height: H, channels: 1 },
  })
    .dilate(2) // sharp's dilate grows the dark side, i.e. it shrinks the product mask
    .blur(1.0)
    .toColourspace("b-w")
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stride = gInfo.channels;

  const out = Buffer.alloc(W * H * 3);
  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const i = y * W + x;
      const m = grown[i * stride] / 255;
      const tgt = targetBackdrop(x / (W - 1), y / (H - 1));
      const lumP = 0.2126 * data[i * 3] + 0.7152 * data[i * 3 + 1] + 0.0722 * data[i * 3 + 2];
      const lumB = 0.2126 * bgRgb[i * 3] + 0.7152 * bgRgb[i * 3 + 1] + 0.0722 * bgRgb[i * 3 + 2];
      // Backdrop + shadow are neutral grey by nature: relight on luminance only,
      // which also removes any colour cast / bounce tint of the old sweep.
      // A backdrop pixel can never be brighter than the sweep itself (no glow).
      const relit = Math.min(tgt + 3, tgt * (lumP / lumB));
      const tint = tintAt(y / (H - 1), tgt);
      const l = reached[i] ? 0 : liftSoft[i] / 255;
      // Lifted pixels are relit per channel RELATIVE to the old sweep (so its
      // colour cast goes away like the backdrop's), with strong bounce tints
      // (red under tomatoes) halved so they do not read as a stain.
      const ratio = [0, 1, 2].map((c) => data[i * 3 + c] / bgRgb[i * 3 + c]);
      const rMean = (ratio[0] + ratio[1] + ratio[2]) / 3;
      const keep = 1 - 0.5 * smooth(0.08, 0.2, Math.max(...ratio) - Math.min(...ratio));
      for (let c = 0; c < 3; c += 1) {
        const lifted = Math.min(tgt + 3, tgt * (rMean + (ratio[c] - rMean) * keep)) * tint[c];
        const p = data[i * 3 + c] + (lifted - data[i * 3 + c]) * l;
        out[i * 3 + c] = Math.max(0, Math.min(255, Math.round(m * p + (1 - m) * relit * tint[c])));
      }
    }
  }

  return sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
