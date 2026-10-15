/**
 * Swap the studio backdrop of EVERY product cover in Supabase to the new light
 * studio grey — deterministically, with no AI and therefore no token cost.
 * See src/lib/images/relight-backdrop.mjs: only backdrop + the photo's own soft
 * shadow are re-lit; product pixels (labels, text, colours) are untouched.
 *
 * Scope: products.image_url and the product_images row(s) carrying that same
 * url (the cover). Gallery images are left alone. `--gallery` also restyles
 * every other product_images row.
 *
 * Safety:
 *  - Default is a DRY RUN: nothing is uploaded and the database is not touched.
 *    It writes old/new/pair previews to scripts/_restyle-backup/<stamp>/ so the
 *    result can be reviewed first.
 *  - --commit uploads the new files to products/relit/ and updates the rows.
 *    Old storage files are never deleted and a manifest with the old urls +
 *    blur hashes is written, so every change can be reverted by hand.
 *
 * Run:
 *   node --env-file=.env.local scripts/relight-db-product-covers.mjs            # preview only
 *   node --env-file=.env.local scripts/relight-db-product-covers.mjs --commit   # apply
 *   append slugs to limit:  ... --commit milk Spice
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { encode } from "blurhash";
import { createClient } from "@supabase/supabase-js";
import { relightBackdrop } from "../src/lib/images/relight-backdrop.mjs";

const BUCKET = "product-images";
const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!sbUrl || !sbKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false } });
const publicPrefix = `${sbUrl}/storage/v1/object/public/${BUCKET}/`;

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const gallery = args.includes("--gallery");
const onlySlugs = args.filter((a) => !a.startsWith("--"));

async function blurHashFromBuffer(buffer) {
  const { data, info } = await sharp(buffer)
    .rotate()
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join("scripts", "_restyle-backup", stamp);
await mkdir(backupDir, { recursive: true });

let query = sb.from("products").select("id, slug, image_url, blur_hash").not("image_url", "is", null);
if (onlySlugs.length) query = query.in("slug", onlySlugs);
const { data: products, error } = await query;
if (error) {
  console.error("Could not list products:", error.message);
  process.exit(1);
}
console.log(`${products.length} product(s) — ${commit ? "COMMIT" : "dry run (preview only)"}`);

const manifest = [];
const cache = new Map(); // old url -> { newUrl, blurHash }

async function relightUrl(oldUrl, label) {
  if (cache.has(oldUrl)) return cache.get(oldUrl);
  let src;
  if (oldUrl.startsWith("/")) {
    // Bundled demo photo served from /public (e.g. /products/milk-2l-v4.png).
    src = await readFile(join("public", oldUrl));
  } else {
    const res = await fetch(oldUrl);
    if (!res.ok) throw new Error(`download ${res.status}`);
    src = Buffer.from(await res.arrayBuffer());
  }
  const out = await relightBackdrop(src);
  const blurHash = await blurHashFromBuffer(out);
  const pair = await sharp({ create: { width: 1600, height: 800, channels: 3, background: "#0c1217" } })
    .composite([
      { input: await sharp(src).resize(800, 800, { fit: "contain", background: "#0c1217" }).toBuffer(), left: 0, top: 0 },
      { input: await sharp(out).resize(800, 800).toBuffer(), left: 800, top: 0 },
    ])
    .jpeg({ quality: 82 })
    .toBuffer();
  await writeFile(join(backupDir, `${label}--before-after.jpg`), pair);

  let newUrl = null;
  if (commit) {
    const path = `products/relit/${Date.now()}-${label}.png`;
    const up = await sb.storage.from(BUCKET).upload(path, out, { contentType: "image/png", upsert: false });
    if (up.error) throw new Error(`upload: ${up.error.message}`);
    newUrl = publicPrefix + path;
  }
  const entry = { newUrl, blurHash };
  cache.set(oldUrl, entry);
  return entry;
}

let ok = 0;
let failed = 0;
for (const product of products) {
  const slug = product.slug;
  try {
    const cover = await relightUrl(product.image_url, slug);
    const { data: rows } = await sb
      .from("product_images")
      .select("id, image_url")
      .eq("product_id", product.id);
    const coverRows = (rows ?? []).filter((r) => r.image_url === product.image_url);
    const galleryRows = gallery ? (rows ?? []).filter((r) => r.image_url !== product.image_url) : [];

    const galleryResults = [];
    for (const row of galleryRows) {
      try {
        galleryResults.push({ id: row.id, old: row.image_url, ...(await relightUrl(row.image_url, `${slug}-${row.id}`)) });
      } catch (err) {
        console.error(`   ✗ gallery ${row.id}: ${err.message}`);
      }
    }

    manifest.push({
      slug,
      product_id: product.id,
      old_image_url: product.image_url,
      old_blur_hash: product.blur_hash,
      new_image_url: cover.newUrl,
      new_blur_hash: cover.blurHash,
      cover_row_ids: coverRows.map((r) => r.id),
      gallery: galleryResults,
    });

    if (commit) {
      const u1 = await sb
        .from("products")
        .update({ image_url: cover.newUrl, blur_hash: cover.blurHash })
        .eq("id", product.id);
      if (u1.error) throw new Error(`update products: ${u1.error.message}`);
      if (coverRows.length) {
        const u2 = await sb
          .from("product_images")
          .update({ image_url: cover.newUrl, blur_hash: cover.blurHash })
          .in("id", coverRows.map((r) => r.id));
        if (u2.error) throw new Error(`update product_images: ${u2.error.message}`);
      }
      for (const g of galleryResults) {
        const u3 = await sb
          .from("product_images")
          .update({ image_url: g.newUrl, blur_hash: g.blurHash })
          .eq("id", g.id);
        if (u3.error) throw new Error(`update gallery ${g.id}: ${u3.error.message}`);
      }
    }
    ok += 1;
    console.log(`✓ ${slug}${commit ? " (updated)" : ""}`);
  } catch (err) {
    failed += 1;
    console.error(`✗ ${slug}: ${err.message}`);
  }
}

await writeFile(join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(
  `\n${commit ? "APPLIED" : "DRY RUN"} — ${ok} ok, ${failed} failed. Previews + manifest: ${backupDir}`,
);
