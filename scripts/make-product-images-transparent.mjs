/**
 * Strip studio white (and leftover dark) backgrounds from public/products PNGs.
 * Copies originals to public/products-original on first run.
 *
 * Run: node scripts/make-product-images-transparent.mjs
 */
import { existsSync } from "node:fs";
import { copyFile, mkdir, readdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const productDir = join(root, "public", "products");
const originalDir = join(root, "public", "products-original");

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function colorDist(r, g, b, br, bg, bb) {
  return Math.hypot(r - br, g - bg, b - bb);
}

function sampleBorderColor(data, width, height) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const add = (x, y) => {
    const i = (y * width + x) * 4;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  };
  for (let x = 0; x < width; x += 1) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    add(0, y);
    add(width - 1, y);
  }
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
  };
}

function isStudioBackground(r, g, b, a, border) {
  if (a < 88) return true;
  const L = luma(r, g, b);
  const sat = saturation(r, g, b);
  const dist = colorDist(r, g, b, border.r, border.g, border.b);
  if (dist < 22 && L > 210) return true;
  if (L > 246 && sat < 0.045) return true;
  if (L < 16 && sat < 0.2) return true;
  return false;
}

function floodClearBackground(data, width, height, border) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const p = i * 4;
    if (!isStudioBackground(data[p], data[p + 1], data[p + 2], data[p + 3], border)) {
      return;
    }
    visited[i] = 1;
    queue.push(i);
  };

  for (let x = 0; x < width; x += 1) {
    tryEnqueue(x, 0);
    tryEnqueue(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryEnqueue(0, y);
    tryEnqueue(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const i = queue[head];
    head += 1;
    const p = i * 4;
    data[p] = 0;
    data[p + 1] = 0;
    data[p + 2] = 0;
    data[p + 3] = 0;
    const x = i % width;
    const y = Math.floor(i / width);
    tryEnqueue(x - 1, y);
    tryEnqueue(x + 1, y);
    tryEnqueue(x, y - 1);
    tryEnqueue(x, y + 1);
  }
}

function featherNearWhiteHalo(data, width, height) {
  for (let i = 0; i < data.length; i += 4) {
    const a = data[i + 3];
    if (a === 0) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const L = luma(r, g, b);
    const sat = saturation(r, g, b);
    if (L > 248 && sat < 0.03) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
    }
  }
}

function opaqueBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 16) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return { left: 0, top: 0, width, height };
  const pad = Math.round(Math.min(width, height) * 0.03);
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const right = Math.min(width - 1, maxX + pad);
  const bottom = Math.min(height - 1, maxY + pad);
  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

async function processImage(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  const border = sampleBorderColor(pixels, info.width, info.height);
  floodClearBackground(pixels, info.width, info.height, border);
  featherNearWhiteHalo(pixels, info.width, info.height);
  floodClearBackground(pixels, info.width, info.height, border);

  const box = opaqueBounds(pixels, info.width, info.height);
  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(box)
    .resize(900, 900, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

await mkdir(originalDir, { recursive: true });
const files = (await readdir(productDir)).filter((name) =>
  name.toLowerCase().endsWith(".png"),
);

for (const name of files) {
  const destPath = join(productDir, name);
  const backupPath = join(originalDir, name);
  if (!existsSync(backupPath)) {
    await copyFile(destPath, backupPath);
  }
  const png = await processImage(backupPath);
  await writeFile(destPath, png);
  console.log(`✓ ${name}`);
}

console.log("✓ product images are transparent");
