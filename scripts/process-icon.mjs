import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

/** Prefer the highest-res brand mark available */
const SOURCE_CANDIDATES = [
  "src/app/icon2.png",
  "src/app/icon1.png",
  "src/app/icon.png",
];

const BG = { r: 11, g: 18, b: 16, alpha: 1 }; // #0b1210

async function resolveSource() {
  for (const rel of SOURCE_CANDIDATES) {
    const full = path.join(root, rel);
    try {
      await fs.access(full);
      return full;
    } catch {
      /* try next */
    }
  }
  throw new Error("No source icon found");
}

/** Strip mockup chrome (white corner brackets / light mats) from the mark */
function scrubMockupChrome(data, width, height) {
  const corner = Math.max(8, Math.round(Math.min(width, height) * 0.16));
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Near-white focus brackets / paper mats anywhere
      if (min >= 200 && max - min <= 24) {
        data[i + 3] = 0;
        continue;
      }

      const inCorner =
        (x < corner && y < corner) ||
        (x >= width - corner && y < corner) ||
        (x < corner && y >= height - corner) ||
        (x >= width - corner && y >= height - corner);

      // Soft anti-aliased arcs only in corners (keep cream H elsewhere)
      if (inCorner && lum >= 140 && max - min <= 40) {
        data[i + 3] = 0;
      }
    }
  }
}

async function prepareLogo(source, size) {
  const { data, info } = await sharp(source)
    .ensureAlpha()
    .resize(size, size, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .raw()
    .toBuffer({ resolveWithObject: true });

  scrubMockupChrome(data, info.width, info.height);

  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

/** Full-bleed square icon (no baked-in rounded corners) for home-screen / PWA */
async function renderOpaqueIcon(source, size, { padRatio = 0.08 } = {}) {
  const pad = Math.round(size * padRatio);
  const inner = size - pad * 2;
  const logo = await prepareLogo(source, inner);

  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: BG,
    },
  })
    .composite([{ input: logo, left: pad, top: pad }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

/** Maskable: extra safe-zone padding so Android crop keeps the mark visible */
async function renderMaskableIcon(source, size) {
  return renderOpaqueIcon(source, size, { padRatio: 0.18 });
}

async function writeIcon(buffer, target) {
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, buffer);
  console.log(`wrote ${target}`);
}

async function main() {
  const source = await resolveSource();
  console.log(`source: ${path.relative(root, source)}`);

  const icon512 = await renderOpaqueIcon(source, 512);
  const icon192 = await renderOpaqueIcon(source, 192);
  const icon180 = await renderOpaqueIcon(source, 180);
  const mask512 = await renderMaskableIcon(source, 512);
  const mask192 = await renderMaskableIcon(source, 192);
  const icon32 = await renderOpaqueIcon(source, 32, { padRatio: 0.06 });
  const icon16 = await renderOpaqueIcon(source, 16, { padRatio: 0.06 });

  await writeIcon(icon512, path.join(root, "src/app/icon.png"));
  await writeIcon(icon180, path.join(root, "src/app/apple-icon.png"));
  await writeIcon(icon512, path.join(root, "public/icon.png"));
  await writeIcon(icon192, path.join(root, "public/icon-192.png"));
  await writeIcon(icon180, path.join(root, "public/apple-icon.png"));
  await writeIcon(mask512, path.join(root, "public/icon-maskable-512.png"));
  await writeIcon(mask192, path.join(root, "public/icon-maskable-192.png"));

  const favicon = await pngToIco([icon16, icon32]);
  await writeIcon(favicon, path.join(root, "src/app/favicon.ico"));
  await writeIcon(favicon, path.join(root, "public/favicon.ico"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
