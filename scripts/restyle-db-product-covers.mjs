/**
 * Re-shoot the COVER image of each Supabase-backed storefront product as a
 * premium studio cover shot: very light neutral-gray seamless background,
 * professional studio lighting, soft realistic contact shadow. Square 1024.
 *
 * Scope: products.image_url + the matching product_images row(s) that carry
 * the SAME url (i.e. the cover). Extra gallery images are left untouched.
 *
 * Safety:
 *  - Old storage files are never deleted.
 *  - Before/after urls + blur hashes are written to
 *    scripts/_restyle-backup/<timestamp>.json and old covers are downloaded
 *    to that folder, so every change can be reverted by hand.
 *  - DB rows are only written with --commit. Without it the script still
 *    generates + uploads the new images and prints what it *would* change.
 *
 * Run:
 *   node --env-file=.env.local scripts/restyle-db-product-covers.mjs            # dry run
 *   node --env-file=.env.local scripts/restyle-db-product-covers.mjs --commit   # apply
 *   ...append slugs to limit:  --commit milkman-chocolate Spice
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { encode } from "blurhash";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "product-images";
// Cost knobs — cheap by default. Override with OPENAI_IMAGE_MODEL / _QUALITY.
const IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL?.trim() || "gpt-image-1-mini";
const IMAGE_QUALITY = process.env.OPENAI_IMAGE_QUALITY?.trim() || "low";
// kinza-cola-250cc is intentionally excluded: it is a real product photo with
// real, legible branding that a generative pass would corrupt.
const SLUGS = [
  "milk",
  "Spice",
  "chocolate-hazelnut-spread",
  "otte-cocoa-biscuit",
  "milkman-chocolate",
  "mazzeh-jalapeno-chips",
  "cocoa-biscuit-with-strawberry-and-banana-cream",
  "dreamies-cat-treats",
  "product-mtbw74pd-l4w7qx",
];

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
Do not render any props, extra objects, or scenery — only the product itself.

Product title: ${title}`;
}

async function blurHashFromBuffer(buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

async function generateStudioShot(srcBuffer, title, key) {
  const png = await sharp(srcBuffer)
    .rotate()
    .resize(1024, 1024, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toBuffer();

  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(png)], { type: "image/png" }), "product.png");
  form.append("prompt", coverPrompt(title));
  form.append("model", IMAGE_MODEL);
  form.append("size", "1024x1024");
  form.append("quality", IMAGE_QUALITY);

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: form,
  });
  if (!res.ok) throw new Error(`openai ${res.status}: ${await res.text()}`);
  const json = await res.json();
  const first = json.data?.[0];
  let out;
  if (first?.b64_json) out = Buffer.from(first.b64_json, "base64");
  else if (first?.url) out = Buffer.from(await (await fetch(first.url)).arrayBuffer());
  else throw new Error("no image in response");

  return sharp(out)
    .resize(1024, 1024, { fit: "inside" })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
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

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const onlySlugs = args.filter((a) => !a.startsWith("--"));
const targets = onlySlugs.length ? SLUGS.filter((s) => onlySlugs.includes(s)) : SLUGS;

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join("scripts", "_restyle-backup", stamp);
await mkdir(backupDir, { recursive: true });
const manifest = [];

for (const slug of targets) {
  try {
    const { data: product, error } = await sb
      .from("products")
      .select("id, slug, name_en, name, image_url, blur_hash")
      .eq("slug", slug)
      .single();
    if (error || !product) throw new Error(`product not found: ${error?.message}`);

    const oldUrl = product.image_url;
    const title = (product.name_en || product.name || slug).trim();
    console.log(`\n• ${slug}  ("${title}")`);
    console.log(`   old: ${oldUrl}`);

    const srcRes = await fetch(oldUrl);
    if (!srcRes.ok) throw new Error(`download old cover ${srcRes.status}`);
    const srcBuffer = Buffer.from(await srcRes.arrayBuffer());
    await writeFile(join(backupDir, `${slug}--old.png`), srcBuffer);

    const shot = await generateStudioShot(srcBuffer, title, key);
    const blurHash = await blurHashFromBuffer(shot);
    await writeFile(join(backupDir, `${slug}--new.png`), shot);

    const newPath = `products/restyled/${Date.now()}-${slug}.png`;
    const up = await sb.storage.from(BUCKET).upload(newPath, shot, { contentType: "image/png", upsert: false });
    if (up.error) throw new Error(`upload: ${up.error.message}`);
    const newUrl = publicPrefix + newPath;
    console.log(`   new: ${newUrl}`);

    // Which product_images rows mirror the cover (same url as the old cover)?
    const { data: coverRows } = await sb
      .from("product_images")
      .select("id, image_url, is_primary, sort_order")
      .eq("product_id", product.id)
      .eq("image_url", oldUrl);

    manifest.push({
      slug,
      product_id: product.id,
      products: { old_image_url: oldUrl, old_blur_hash: product.blur_hash, new_image_url: newUrl, new_blur_hash: blurHash },
      product_images_rows: (coverRows ?? []).map((r) => r.id),
      new_storage_path: newPath,
    });
    console.log(`   product_images cover rows: ${(coverRows ?? []).length}`);

    if (commit) {
      const u1 = await sb.from("products").update({ image_url: newUrl, blur_hash: blurHash }).eq("id", product.id);
      if (u1.error) throw new Error(`update products: ${u1.error.message}`);
      if (coverRows?.length) {
        const u2 = await sb
          .from("product_images")
          .update({ image_url: newUrl, blur_hash: blurHash })
          .in("id", coverRows.map((r) => r.id));
        if (u2.error) throw new Error(`update product_images: ${u2.error.message}`);
      }
      console.log("   ✓ DB updated");
    } else {
      console.log("   (dry run — DB not touched)");
    }
  } catch (err) {
    console.error(`   ✗ ${slug}: ${err.message}`);
  }
}

await writeFile(join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`\n${commit ? "APPLIED" : "DRY RUN"} — backup + manifest in ${backupDir}`);
