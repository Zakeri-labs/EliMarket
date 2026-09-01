/**
 * One-off check of the Gemini image backend BEFORE enabling it in the app.
 * Runs one product photo through Gemini 2.5 Flash Image with the same studio
 * prompt the app uses, so you can eyeball whether the label survives.
 *
 *   GEMINI_API_KEY=... node scripts/test-gemini-image.mjs milk-2l
 *   node --env-file=.env.local scripts/test-gemini-image.mjs otte-cocoa-biscuit
 *
 * Input:  public/products-original/<name>.png  (falls back to any path you pass)
 * Output: scripts/_gemini-test/<name>.png
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import sharp from "sharp";

const MODEL = process.env.AI_IMAGE_MODEL?.trim() || "gemini-2.5-flash-image";
const key =
  process.env.GEMINI_API_KEY?.trim() || process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
if (!key) {
  console.error("Set GEMINI_API_KEY (or add it to .env.local and use --env-file=.env.local).");
  process.exit(1);
}

const arg = process.argv[2];
if (!arg) {
  console.error("Pass a product name (e.g. milk-2l) or an image path.");
  process.exit(1);
}
const srcPath = arg.includes("/") || arg.endsWith(".png")
  ? arg
  : `public/products-original/${arg}.png`;
const name = basename(srcPath).replace(/\.png$/i, "");

const STYLE = [
  "Background: a clean, seamless studio backdrop in a soft, even LIGHT GREY — clearly grey, never pure white; no patterns, no props, no visible seams or banding; the product is cleanly separated from it.",
  "Lighting: professional STUDIO LIGHTING — a soft, directional key light with gentle fill, a subtle brighter pool behind the product falling off gradually toward the corners, and realistic highlights/reflections true to the product's material. Never flat or evenly lit.",
  "Shadow: a soft, diffused, realistic CONTACT SHADOW directly beneath the product that anchors it to the surface — never a hard or detached drop shadow.",
  "Realism: the image must look like a real DSLR studio PHOTOGRAPH — natural surface texture, micro-imperfections and true material response. Absolutely NO cartoon, illustration, 3D render, CGI, or plasticky / waxy / over-smoothed look.",
  "Label fidelity: the packaging, brand mark, and EVERY piece of printed text must be reproduced EXACTLY as in the source image — same wording, same script, same spelling, same layout, same fonts, same colours, character for character (including Persian/Arabic text and small print). Do NOT translate, restyle, re-typeset, paraphrase, blur, or invent any text or logo. If a detail is unreadable in the source, leave that area as a plain unlabelled surface rather than guessing.",
].join("\n");

const prompt = `You are an expert commercial product photographer. The uploaded image is the SOURCE OF TRUTH — keep the exact same physical product (shape, colours, materials, packaging, logos, every label and printed character). Do not redesign or reinterpret it.

Create the PRIMARY e-commerce cover image of this product: product centred, fully in frame, comfortable margin.

${STYLE}`;

const png = await sharp(await readFile(srcPath))
  .rotate()
  .resize(1024, 1024, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
  .png()
  .toBuffer();

const res = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${encodeURIComponent(key)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [
        { text: prompt },
        { inlineData: { mimeType: "image/png", data: png.toString("base64") } },
      ] }],
      generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.3 },
    }),
  },
);

if (!res.ok) {
  console.error(`Gemini ${res.status}: ${await res.text()}`);
  process.exit(1);
}
const json = await res.json();
const parts = json?.candidates?.[0]?.content?.parts ?? [];
const imgPart = parts.find((p) => p?.inlineData?.data || p?.inline_data?.data);
if (!imgPart) {
  console.error("No image in response:", JSON.stringify(json).slice(0, 800));
  process.exit(1);
}
const out = Buffer.from(imgPart.inlineData?.data ?? imgPart.inline_data.data, "base64");

await mkdir("scripts/_gemini-test", { recursive: true });
const dest = join("scripts/_gemini-test", `${name}.png`);
await writeFile(dest, await sharp(out).resize(1024, 1024, { fit: "inside" }).png().toBuffer());
console.log(`✓ ${dest}  (model ${MODEL})`);
const textPart = parts.find((p) => p?.text)?.text;
if (textPart) console.log("model note:", textPart.slice(0, 300));
