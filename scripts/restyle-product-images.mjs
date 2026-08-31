/**
 * Re-shoot every static storefront product image as a premium studio cover
 * shot: neutral very-light-gray seamless background, professional studio
 * lighting, and a soft realistic contact shadow — matching the store's
 * catalog photography style.
 *
 * Source of truth is public/products-original/<name>.png (untouched originals).
 * Output overwrites public/products/<name>.png. Re-runnable: it always reads
 * from products-original, so a bad batch can just be re-run.
 *
 * Uses OpenAI gpt-image-1 (images/edits). Needs OPENAI_API_KEY.
 * Run: node --env-file=.env.local scripts/restyle-product-images.mjs
 *
 * Note: like src/lib/ai/generate-product-cover-shot.ts, this regenerates the
 * product's pixels. The current 8 images are label-free (produce, plain
 * packaging), so text hallucination is not a concern here — but eyeball each
 * result before shipping if you ever add a labeled product to the set.
 */
import { readdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const originalDir = join(root, "public", "products-original");
const outDir = join(root, "public", "products");
// Output basenames carry a version suffix so a regenerated image is a NEW URL
// everywhere (browser cache, CDN, and the cache-first service worker all key
// on the path). Bump this when regenerating, and update the matching paths in
// product-mock.ts, the seed migration, and the live DB rows.
const OUT_SUFFIX = "-v2";

// Filename (without .png) -> catalog title fed to the prompt.
const TITLES = {
  bananas: "Bananas",
  tomatoes: "Tomatoes",
  "milk-2l": "Milk bottle, 2 liter",
  "eggs-15": "Eggs, 15 pack",
  "bread-loaf": "Crusty bread loaf",
  "chicken-breast": "Raw chicken breast fillets",
  "orange-juice": "Orange juice bottle, 1 liter",
  "potato-chips": "Bag of potato chips",
};

const FIDELITY_RULES =
  "You are an expert AI commercial product photographer specializing in high-end e-commerce product photography. " +
  "The uploaded product image is the PRIMARY SOURCE OF TRUTH. Carefully analyze it and preserve: exact product shape, proportions, dimensions, geometry, colors, materials, surface texture, packaging, logos, brand identity, labels, printed text, buttons/handles/caps/components. " +
  "Do not redesign, improve, simplify, modernize, or reinterpret the product. Do not invent missing features, change its color or packaging, replace its logos, or add accessories not present in the reference. The generated product must clearly be the SAME physical product shown in the uploaded image. " +
  "Never generate a cartoon, illustration, 3D render, CGI look, deformed product, incorrect proportions, extra or missing components, fake logos/text/labels, people, hands, props, watermarks, or promotional text — the result must be photorealistic.";

function coverPrompt(title) {
  return `${FIDELITY_RULES}

Create the PRIMARY, standard e-commerce cover image of this product.
Background: clean, seamless studio background of a soft light-to-medium neutral gray — a clear, calm dove gray at roughly 75% lightness, distinctly gray and obviously NOT white or near-white, but still light enough to keep the product bright. Smooth and even, no patterns, no vignette edges, no distracting elements, product clearly separated from the background.
Position: product prominently centered, fully visible and completely inside the frame, balanced comfortable negative space around it.
Lighting: professional studio lighting, soft but clearly directional key light with gentle fill, realistic highlights and reflections appropriate to the product's material — avoid flat lighting.
Shadow: a realistic soft, diffused natural contact shadow beneath the product that anchors it to the surface — never an artificial flat drop shadow.
Camera: straightforward, product-focused angle, natural perspective, sharp details, minimal distortion, high-end studio camera look.

Product title: ${title}`;
}

const SIZE = "1024x1024";
// Superseded by restyle-static-photoreal.mjs (free, local). If you do run this,
// it defaults to the cheap image model/quality — override via env if needed.
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1-mini";
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY?.trim() || "low";

async function restyle(name, key) {
  const srcPath = join(originalDir, `${name}.png`);
  const title = TITLES[name] ?? "grocery product";

  // Pad the source onto a square canvas so the model returns a square frame
  // with the product fully inside it (storefront image slots are all
  // aspect-square + object-contain, so a landscape result would letterbox).
  const png = await sharp(await readFile(srcPath))
    .rotate()
    .resize(1024, 1024, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(png)], { type: "image/png" }), "product.png");
  form.append("prompt", coverPrompt(title));
  form.append("model", IMAGE_MODEL);
  form.append("size", SIZE);
  form.append("quality", IMAGE_QUALITY);

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) {
    throw new Error(`${name}: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  const first = json.data?.[0];
  let out;
  if (first?.b64_json) {
    out = Buffer.from(first.b64_json, "base64");
  } else if (first?.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) throw new Error(`${name}: fetch result ${imgRes.status}`);
    out = Buffer.from(await imgRes.arrayBuffer());
  } else {
    throw new Error(`${name}: no image in response`);
  }

  const normalized = await sharp(out)
    .resize(1024, 1024, { fit: "inside" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
  await writeFile(join(outDir, `${name}${OUT_SUFFIX}.png`), normalized);
  console.log(`✓ ${name}${OUT_SUFFIX}.png`);
}

const key = process.env.OPENAI_API_KEY?.trim();
if (!key) {
  console.error("OPENAI_API_KEY missing. Run with: node --env-file=.env.local scripts/restyle-product-images.mjs");
  process.exit(1);
}

const names = (await readdir(originalDir))
  .filter((n) => n.toLowerCase().endsWith(".png"))
  .map((n) => n.slice(0, -4));

const only = process.argv.slice(2);
const targets = only.length ? names.filter((n) => only.includes(n)) : names;

for (const name of targets) {
  try {
    await restyle(name, key);
  } catch (err) {
    console.error(`✗ ${err.message}`);
  }
}

console.log("done");
