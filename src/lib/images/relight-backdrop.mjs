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

/** Target look: light studio grey, brighter toward the bottom, soft light pool. */
export const TARGET = {
  top: 194, // grey level at the top edge
  bottom: 224, // grey level at the bottom edge
  glow: 6, // extra brightness of the soft light pool behind the product
  corner: 9, // corner fall-off
};

const WORK = 1024;
const G = 48; // fitting grid

function targetBackdrop(x, y) {
  const u = x * 2 - 1;
  const v = y * 2 - 1;
  const base = TARGET.top + (TARGET.bottom - TARGET.top) * y;
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
  const mask = new Uint8Array(W * H);
  for (let i = 0; i < mask.length; i += 1) mask[i] = reached[i] ? 0 : 255;

  // Shrink by a pixel (drops the edge band) and soften slightly.
  const { data: grown, info: gInfo } = await sharp(Buffer.from(mask), {
    raw: { width: W, height: H, channels: 1 },
  })
    .dilate(1) // sharp's dilate grows the dark side, i.e. it shrinks the product mask
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
      for (let c = 0; c < 3; c += 1) {
        const p = data[i * 3 + c];
        out[i * 3 + c] = Math.max(0, Math.min(255, Math.round(m * p + (1 - m) * relit)));
      }
    }
  }

  return sharp(out, { raw: { width: W, height: H, channels: 3 } })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
