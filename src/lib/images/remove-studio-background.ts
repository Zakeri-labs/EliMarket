import sharp from "sharp";

function luma(r: number, g: number, b: number) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r: number, g: number, b: number) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function colorDist(
  r: number,
  g: number,
  b: number,
  br: number,
  bg: number,
  bb: number,
) {
  return Math.hypot(r - br, g - bg, b - bb);
}

function sampleBorderColor(data: Uint8Array, width: number, height: number) {
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  const add = (x: number, y: number) => {
    const i = (y * width + x) * 4;
    r += data[i]!;
    g += data[i + 1]!;
    b += data[i + 2]!;
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

function isStudioBackground(
  r: number,
  g: number,
  b: number,
  a: number,
  border: { r: number; g: number; b: number },
) {
  if (a < 88) return true;
  const L = luma(r, g, b);
  const sat = saturation(r, g, b);
  const dist = colorDist(r, g, b, border.r, border.g, border.b);
  if (dist < 28) return true;
  if (L > 242 && sat < 0.06) return true;
  if (L < 18 && sat < 0.22) return true;
  return false;
}

function floodClear(
  data: Uint8Array,
  width: number,
  height: number,
  border: { r: number; g: number; b: number },
) {
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const tryEnqueue = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const p = i * 4;
    if (
      !isStudioBackground(data[p]!, data[p + 1]!, data[p + 2]!, data[p + 3]!, border)
    ) {
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
    const i = queue[head]!;
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

function opaqueShare(data: Uint8Array) {
  let opaque = 0;
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! >= 16) opaque += 1;
  }
  return opaque / (data.length / 4);
}

function opaqueBounds(data: Uint8Array, width: number, height: number) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3]! < 16) continue;
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

/** Strip edge-connected studio / uniform backgrounds and return a cropped PNG. */
export async function removeStudioBackground(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .rotate()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data);
  const originalShare = opaqueShare(pixels);
  const border = sampleBorderColor(pixels, info.width, info.height);
  floodClear(pixels, info.width, info.height, border);
  const clearedShare = opaqueShare(pixels);

  if (clearedShare < 0.06 || clearedShare > originalShare * 0.98) {
    return sharp(input)
      .rotate()
      .ensureAlpha()
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }

  const box = opaqueBounds(pixels, info.width, info.height);
  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(box)
    .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}
