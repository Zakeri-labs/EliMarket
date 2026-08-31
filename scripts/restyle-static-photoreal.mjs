/**
 * Photo-real version of the 8 static product covers.
 *
 * gpt-image-1 (restyle-product-images.mjs) turned the organic products into a
 * CGI / 3D-render look. This script never regenerates a single product pixel.
 * It takes the REAL photo in public/products-original/*.png (product on a
 * white sweep) and applies ONE monotonic highlight-compression curve to the
 * whole frame:
 *
 *   pixels darker than KNEE  -> untouched  (all product colour + detail)
 *   pixels brighter than KNEE -> luma scaled down so pure white lands on the
 *                                target gray, hue preserved (same factor on
 *                                R/G/B)
 *
 * So the white background and the photo's own soft shadow roll into a single
 * calm gray, while product highlights only dim very slightly. No segmentation,
 * no flood fill — every pixel gets the same curve, so there are no halos,
 * cut-out fringes, or smudges.
 *
 * Output basenames carry the -v3 suffix (new URL busts every cache layer).
 * Run: node scripts/restyle-static-photoreal.mjs
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const originalDir = join(root, "public", "products-original");
const outDir = join(root, "public", "products");
const OUT_SUFFIX = "-v3";

const CANVAS = 1024;
const TARGET = 212;  // pure white lands here
const KNEE = 196;    // below this luma nothing changes

function toneCurve() {
  // lookup table: input luma -> output scale factor (x1000, integer)
  const lut = new Float64Array(256);
  for (let L = 0; L < 256; L += 1) {
    if (L <= KNEE) { lut[L] = 1; continue; }
    const newL = KNEE + ((L - KNEE) * (TARGET - KNEE)) / (255 - KNEE);
    lut[L] = newL / L;
  }
  return lut;
}

async function render(bytes) {
  const { data, info } = await sharp(bytes).rotate().removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const px = Buffer.from(data);
  const lut = toneCurve();
  for (let i = 0; i < px.length; i += 3) {
    const r = px[i], g = px[i + 1], b = px[i + 2];
    const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const f = lut[Math.round(L)];
    if (f === 1) continue;
    px[i] = Math.min(255, Math.round(r * f));
    px[i + 1] = Math.min(255, Math.round(g * f));
    px[i + 2] = Math.min(255, Math.round(b * f));
  }

  const toned = await sharp(px, { raw: { width: info.width, height: info.height, channels: 3 } }).png().toBuffer();

  return sharp({ create: { width: CANVAS, height: CANVAS, channels: 3, background: { r: TARGET, g: TARGET, b: TARGET + 1 } } })
    .composite([{
      input: await sharp(toned).resize(Math.round(CANVAS * 0.9), Math.round(CANVAS * 0.9), { fit: "inside" }).toBuffer(),
      gravity: "centre",
    }])
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

const names = (await readdir(originalDir)).filter((n) => n.toLowerCase().endsWith(".png"));
const only = process.argv.slice(2);
for (const file of names) {
  const base = file.replace(/\.png$/i, "");
  if (only.length && !only.includes(base)) continue;
  const out = await render(await readFile(join(originalDir, file)));
  await writeFile(join(outDir, `${base}${OUT_SUFFIX}.png`), out);
  console.log(`✓ ${base}${OUT_SUFFIX}.png`);
}
console.log("done");
