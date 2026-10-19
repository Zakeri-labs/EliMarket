/**
 * Re-shoot the COVER of EVERY Supabase storefront product with AI, from the best available
 * ORIGINAL photo (not from an earlier AI cover that may carry invented labels):
 *   - label rules: a vision pass reads the real packaging text off the source. No printed text
 *     => the prompt forbids any label/text at all; text found => it must be reproduced verbatim.
 *   - shadow rules: the central style block (src/lib/ai/ai-config-defaults.ts) — ONE soft dark-grey
 *     contact shadow, always to the LEFT, no white halo, no shadow on the right.
 *
 * Source priority per product: public/products-original/<file> (seed photos) → the oldest local
 * backup in scripts/_restyle-backup/**\/<slug>--old.png → the current cover.
 *
 * Safe by default: dry run uploads + saves previews to scripts/_restyle-backup/<stamp>/ but does not
 * touch DB rows. --commit updates products.image_url + the product_images cover rows. Old storage
 * files are never deleted; the manifest records old urls + blur hashes.
 *
 * Run:
 *   node --env-file=.env.local scripts/reshoot-all-db-product-covers.mjs                 # dry run, all
 *   node --env-file=.env.local scripts/reshoot-all-db-product-covers.mjs --commit        # apply
 *   ...append slugs to limit:  --commit Spice crusty-bread-500g
 * Env: OPENAI_IMAGE_MODEL (default gpt-image-1), OPENAI_IMAGE_QUALITY (default medium).
 */
import { existsSync, readdirSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { encode } from "blurhash";
import { createClient } from "@supabase/supabase-js";
import { DEFAULT_AI_STYLE, buildStyleBlock } from "../src/lib/ai/ai-config-defaults.ts";

const BUCKET = "product-images";
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1";
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY?.trim() || "medium";
const VISION_MODEL = process.env.OPENAI_VISION_MODEL?.trim() || "gpt-4o-mini";

// Seed photos (clean, unlabeled originals).
const ORIGINAL_FILES = {
  "bananas-kg": "bananas",
  "crusty-bread-500g": "bread-loaf",
  "chicken-breast-1kg": "chicken-breast",
  "eggs-15-pack": "eggs-15",
  "milk-full-fat-2l": "milk-2l",
  "orange-juice-1l": "orange-juice",
  "potato-chips-200g": "potato-chips",
  "tomatoes-kg": "tomatoes",
};

/** Oldest local backup original for a slug (folders are timestamp-named, so sorted = chronological). */
function oldestBackup(slug) {
  const root = join("scripts", "_restyle-backup");
  if (!existsSync(root)) return null;
  for (const dir of readdirSync(root).filter((d) => d.startsWith("2026-")).sort()) {
    const file = join(root, dir, `${slug}--old.png`);
    if (existsSync(file)) return file;
  }
  return null;
}

const key = process.env.OPENAI_API_KEY?.trim();
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key || !sbUrl || !sbKey) {
  console.error("Need OPENAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
const publicPrefix = `${sbUrl}/storage/v1/object/public/${BUCKET}/`;

/** Reads the text PRINTED on the packaging. [] = the product carries no printed text at all. */
async function transcribeLabel(png) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: VISION_MODEL,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: 'You transcribe printed text on product packaging. Reply with JSON only: {"lines": string[]}.' },
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                "Read the text that is physically PRINTED on the product's own packaging/label in this photo and return it exactly as written: one entry per visible line, in reading order, in its ORIGINAL script and spelling. Do not translate, correct, complete or guess. Ignore text added on top of the photo (banners, watermarks). Fresh produce, bread, meat, spices, loose goods, plain egg trays and plain bowls have NO printed text: return an empty list for them.",
            },
            { type: "image_url", image_url: { url: `data:image/png;base64,${png.toString("base64")}` } },
          ],
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`vision ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = await res.json();
  const lines = JSON.parse(json.choices?.[0]?.message?.content ?? "{}").lines;
  return Array.isArray(lines) ? lines.filter((l) => typeof l === "string" && l.trim()).map((l) => l.trim()) : [];
}

function coverPrompt(title, lines) {
  const labelRule = lines.length
    ? `EXACT PACKAGING TEXT (read from the real photo): ${lines.map((l) => `"${l}"`).join(" / ")}. The label must show exactly this text, character for character, same script, spelling, order and layout; never paraphrase, translate, complete or invent any word. Copy every logo and illustration from the uploaded photo; if a line cannot be rendered perfectly, keep that area as it looks in the uploaded photo.`
    : "THIS PRODUCT HAS NO LABEL: the uploaded photo shows no printed text, brand or sticker, so the result must contain NO label, NO sticker, NO brand, NO logo, NO barcode and NO text of any kind — not on the product, a bowl, tray, bag or anywhere else. Keep it exactly as bare as in the photo.";
  return `You are an expert AI commercial product photographer for high-end e-commerce. The uploaded image is the PRIMARY SOURCE OF TRUTH: preserve the exact product — shape, proportions, colors, materials, texture, packaging, components, quantity and arrangement. Do not redesign, simplify, add or remove anything; it must clearly be the SAME physical product. Remove any old background, old shadow (including light, white, torn or jagged halos/remnants around the product) and any added banners/watermarks completely; only the product stays.
${labelRule}
Never generate a cartoon, illustration, 3D render, extra props, people, hands or promotional text — photorealistic only.

EDIT this photo into the PRIMARY e-commerce cover: the product exactly as it is — same shape, angle and position, centered and fully inside the frame with generous empty margin on every side (never cropped or enlarged), on a fresh, smooth studio sweep with the lighting and the ONE-SIDED contact shadow described below.
Camera: straightforward product-focused angle, natural perspective, sharp details.

${buildStyleBlock(DEFAULT_AI_STYLE)}

Product title: ${title}`;
}

async function blurHashFromBuffer(buffer) {
  const { data, info } = await sharp(buffer).rotate().raw().ensureAlpha().resize(32, 32, { fit: "inside" }).toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

async function editImage(png, prompt) {
  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(png)], { type: "image/png" }), "product.png");
  form.append("prompt", prompt);
  form.append("model", IMAGE_MODEL);
  form.append("size", "1024x1024");
  form.append("quality", IMAGE_QUALITY);
  const res = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${key}` }, body: form });
  if (!res.ok) throw new Error(`openai ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const first = (await res.json()).data?.[0];
  if (first?.b64_json) return Buffer.from(first.b64_json, "base64");
  if (first?.url) return Buffer.from(await (await fetch(first.url)).arrayBuffer());
  throw new Error("no image in response");
}

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const onlySlugs = args.filter((a) => !a.startsWith("--"));

const { data: all, error: listErr } = await sb.from("products").select("id, slug, name_en, name, image_url, blur_hash");
if (listErr) throw new Error(listErr.message);
const targets = onlySlugs.length ? all.filter((p) => onlySlugs.includes(p.slug)) : all;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join("scripts", "_restyle-backup", stamp);
await mkdir(backupDir, { recursive: true });
const manifest = [];

for (const product of targets) {
  const slug = product.slug;
  try {
    const title = (product.name_en || product.name || slug).trim();
    let srcBuffer;
    let srcLabel;
    const seed = ORIGINAL_FILES[slug] && join("public", "products-original", `${ORIGINAL_FILES[slug]}.png`);
    const backup = oldestBackup(slug);
    if (seed && existsSync(seed)) [srcBuffer, srcLabel] = [await readFile(seed), seed];
    else if (backup) [srcBuffer, srcLabel] = [await readFile(backup), backup];
    else [srcBuffer, srcLabel] = [Buffer.from(await (await fetch(product.image_url)).arrayBuffer()), "current cover"];
    console.log(`\n• ${slug}  ("${title}")  source: ${srcLabel}`);

    const png = await sharp(srcBuffer)
      .rotate()
      .resize(1024, 1024, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 1 } })
      .flatten({ background: "#ffffff" })
      .png()
      .toBuffer();

    const lines = await transcribeLabel(png);
    console.log(lines.length ? `   label text: ${lines.join(" / ").slice(0, 160)}` : "   no printed text → NO label allowed");

    let out;
    for (let attempt = 1; attempt <= 2 && !out; attempt += 1) {
      try {
        out = await editImage(png, coverPrompt(title, lines));
      } catch (err) {
        console.error(`   attempt ${attempt} failed: ${err.message}`);
      }
    }
    if (!out) throw new Error("image generation failed");
    const shot = await sharp(out).resize(1024, 1024, { fit: "inside" }).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
    await writeFile(join(backupDir, `${slug}--new.png`), shot);

    const blurHash = await blurHashFromBuffer(shot);
    const newPath = `products/reshot/${Date.now()}-${slug}.png`;
    const up = await sb.storage.from(BUCKET).upload(newPath, shot, { contentType: "image/png", upsert: false });
    if (up.error) throw new Error(`upload: ${up.error.message}`);
    const newUrl = publicPrefix + newPath;

    const { data: coverRows } = await sb.from("product_images").select("id").eq("product_id", product.id).eq("image_url", product.image_url);
    manifest.push({ slug, product_id: product.id, old_image_url: product.image_url, old_blur_hash: product.blur_hash, new_image_url: newUrl, new_blur_hash: blurHash, product_images_rows: (coverRows ?? []).map((r) => r.id) });
    console.log(`   new: ${newUrl}`);

    if (commit) {
      const u1 = await sb.from("products").update({ image_url: newUrl, blur_hash: blurHash }).eq("id", product.id);
      if (u1.error) throw new Error(`update products: ${u1.error.message}`);
      if (coverRows?.length) {
        const u2 = await sb.from("product_images").update({ image_url: newUrl, blur_hash: blurHash }).in("id", coverRows.map((r) => r.id));
        if (u2.error) throw new Error(`update product_images: ${u2.error.message}`);
      }
      console.log("   ✓ DB updated");
    }
  } catch (err) {
    console.error(`   ✗ ${slug}: ${err.message}`);
  }
}

await writeFile(join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\n${commit ? "APPLIED" : "DRY RUN"} — previews + manifest in ${backupDir}`);
