import sharp from "sharp";
import pngToIco from "png-to-ico";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const appDir = join(__dirname, "..", "src", "app");
const source = join(appDir, "favicon.ico");

function alphaForPixel(r, g, b, a) {
  if (a === 0) return 0;

  const maxC = Math.max(r, g, b);
  const greenLead = g - Math.max(r, b);

  // Icon stroke / glow (teal-green)
  if (greenLead > 12 && g > 35) return Math.min(255, a);
  if (greenLead > 4 && g > 22 && maxC > 28) {
    return Math.min(255, Math.round(a * (0.35 + greenLead / 40)));
  }

  // Dark neutral background inside the rounded square
  if (maxC < 130 && greenLead < 6) return 0;

  return 0;
}

async function makeTransparentPng(inputPath, size) {
  const { data, info } = await sharp(inputPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const pixels = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i += info.channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3] ?? 255;
    const nextAlpha = alphaForPixel(r, g, b, a);

    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = nextAlpha;
  }

  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

const icon512Path = join(appDir, "icon.png");
const icon192Path = join(appDir, "apple-icon.png");

writeFileSync(icon512Path, await makeTransparentPng(source, 512));
writeFileSync(icon192Path, await makeTransparentPng(source, 192));

const icoBuffer = await pngToIco(icon512Path);
writeFileSync(join(appDir, "favicon.ico"), icoBuffer);

console.log("Created transparent icon.png, apple-icon.png, and favicon.ico");
