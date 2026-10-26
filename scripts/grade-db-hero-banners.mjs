/**
 * Colour-grade EVERY hero banner image in Supabase so its dark wall/counter is
 * the same near-black teal as the storefront page — deterministically, with no
 * AI and therefore no token cost. See src/lib/images/grade-hero-banner.mjs.
 *
 * Scope: hero_banners.image_url (RTL), image_url_ltr and image_url_mobile.
 *
 * Safety:
 *  - Default is a DRY RUN: nothing is uploaded and the database is not touched.
 *    It writes before/after previews to scripts/_restyle-backup/hero-<stamp>/.
 *  - --commit uploads the new files to hero/graded/ and updates the rows.
 *    Old storage files are never deleted and a manifest with the old urls +
 *    blur hashes is written, so every change can be reverted by hand.
 *  - --from-manifest=<manifest.json> grades the ORIGINAL images recorded by an
 *    earlier run instead of the (already graded) current ones.
 *
 * Run:
 *   node --env-file=.env.local scripts/grade-db-hero-banners.mjs            # preview only
 *   node --env-file=.env.local scripts/grade-db-hero-banners.mjs --commit   # apply
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";
import { encode } from "blurhash";
import { createClient } from "@supabase/supabase-js";
import { gradeHeroBanner } from "../src/lib/images/grade-hero-banner.mjs";

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
const manifestArg = args.find((a) => a.startsWith("--from-manifest="));
const originals = new Map(); // `${id}:${column}` -> { url, blurHash }
if (manifestArg) {
  const prev = JSON.parse(await readFile(manifestArg.slice("--from-manifest=".length), "utf8"));
  for (const e of prev) originals.set(`${e.id}:${e.column}`, { url: e.old_url, blurHash: e.old_blur_hash });
}

// image column -> its blur hash column
const COLUMNS = {
  image_url: "blur_hash",
  image_url_ltr: "blur_hash_ltr",
  image_url_mobile: "blur_hash_mobile",
};

async function blurHashFromBuffer(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .toBuffer({ resolveWithObject: true });
  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join("scripts", "_restyle-backup", `hero-${stamp}`);
await mkdir(backupDir, { recursive: true });

const { data: banners, error } = await sb
  .from("hero_banners")
  .select(["id", ...Object.entries(COLUMNS).flat()].join(", "));
if (error) {
  console.error("Could not list hero banners:", error.message);
  process.exit(1);
}
console.log(`${banners.length} banner(s) — ${commit ? "COMMIT" : "dry run (preview only)"}`);

const manifest = [];
let ok = 0;
let failed = 0;
for (const banner of banners) {
  for (const [column, hashColumn] of Object.entries(COLUMNS)) {
    const original = originals.get(`${banner.id}:${column}`);
    const sourceUrl = original?.url ?? banner[column]?.trim();
    if (!sourceUrl) continue;
    // Already graded by an earlier run: grading twice would darken it again.
    if (!original && sourceUrl.includes("/hero/graded/")) continue;
    const label = `${banner.id.slice(0, 8)}-${column}`;
    try {
      let src;
      if (sourceUrl.startsWith("/")) {
        src = await readFile(join("public", sourceUrl));
      } else {
        const res = await fetch(sourceUrl);
        if (!res.ok) throw new Error(`download ${res.status}`);
        src = Buffer.from(await res.arrayBuffer());
      }
      const out = await gradeHeroBanner(src);
      const blurHash = await blurHashFromBuffer(out);

      const meta = await sharp(src).metadata();
      const h = Math.round((800 * meta.height) / meta.width);
      const pair = await sharp({ create: { width: 1600, height: h, channels: 3, background: "#0c1217" } })
        .composite([
          { input: await sharp(src).resize(800, h).toBuffer(), left: 0, top: 0 },
          { input: await sharp(out).resize(800, h).toBuffer(), left: 800, top: 0 },
        ])
        .jpeg({ quality: 82 })
        .toBuffer();
      await writeFile(join(backupDir, `${label}--before-after.jpg`), pair);

      let newUrl = null;
      if (commit) {
        const path = `hero/graded/${Date.now()}-${label}.webp`;
        const up = await sb.storage.from(BUCKET).upload(path, out, { contentType: "image/webp", upsert: false });
        if (up.error) throw new Error(`upload: ${up.error.message}`);
        newUrl = publicPrefix + path;
        const u = await sb
          .from("hero_banners")
          .update({ [column]: newUrl, [hashColumn]: blurHash })
          .eq("id", banner.id);
        if (u.error) throw new Error(`update: ${u.error.message}`);
      }
      manifest.push({
        id: banner.id,
        column,
        old_url: sourceUrl,
        old_blur_hash: original?.blurHash ?? banner[hashColumn] ?? null,
        new_url: newUrl,
        new_blur_hash: blurHash,
      });
      ok += 1;
      console.log(`✓ ${label}${commit ? " (updated)" : ""}`);
    } catch (err) {
      failed += 1;
      console.error(`✗ ${label}: ${err.message}`);
    }
  }
}

await writeFile(join(backupDir, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(
  `\n${commit ? "APPLIED" : "DRY RUN"} — ${ok} ok, ${failed} failed. Previews + manifest: ${backupDir}`,
);
