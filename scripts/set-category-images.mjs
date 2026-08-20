/**
 * Make public/categories images true transparent PNGs, rename by slug,
 * write a SQL migration, and apply image_url on the live database.
 *
 * Run: node --env-file=.env.local scripts/set-category-images.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { encode } from "blurhash";
import { mkdir, readdir, unlink, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const categoryDir = join(root, "public", "categories");
const sourceDir = join(root, "public", "categories copy");
const migrationsDir = join(root, "supabase", "migrations");

const SOURCE_BY_SLUG = {
  produce: "vegtables.png",
  dairy: "dray&egges.png",
  meat: "meet.png",
  bakery: "Bakery.png",
  beverages: "Beverage .png",
  snacks: "Snack Collection.png",
  pantry: "Pantry.png",
  "personal-care": "personal care.png",
  household: "Household.png",
};

function luma(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function saturation(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function isBackgroundPixel(r, g, b, a) {
  if (a < 88) return true;
  const L = luma(r, g, b);
  const sat = saturation(r, g, b);
  if (L < 22) return true;
  if (L < 40 && sat < 0.42) return true;
  return false;
}

function floodClearBackground(data, width, height) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryEnqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (visited[i]) return;
    const p = i * 4;
    if (!isBackgroundPixel(data[p], data[p + 1], data[p + 2], data[p + 3])) return;
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
    const i = queue[head];
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

function hardenSubjectAlpha(data) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a === 0) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      continue;
    }
    if (a < 40 || (luma(r, g, b) < 16 && a < 230)) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 0;
      continue;
    }
    if (a >= 150) data[i + 3] = 255;
  }
}

function opaqueBounds(data, width, height) {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] < 16) continue;
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

async function blurHashFromPng(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .resize(32, 32, { fit: "inside" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4,
    3,
  );
}

async function processImage(sourcePath) {
  const { data, info } = await sharp(sourcePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const pixels = new Uint8Array(data);
  floodClearBackground(pixels, info.width, info.height);
  hardenSubjectAlpha(pixels);
  floodClearBackground(pixels, info.width, info.height);

  const box = opaqueBounds(pixels, info.width, info.height);
  return sharp(pixels, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .extract(box)
    .resize(900, 900, {
      fit: "inside",
      withoutEnlargement: true,
    })
    .png({ compressionLevel: 9, adaptiveFiltering: true })
    .toBuffer();
}

function sqlLiteral(value) {
  return `'${value.replaceAll("'", "''")}'`;
}

async function processAll() {
  const results = [];
  const keep = new Set();

  for (const [slug, sourceName] of Object.entries(SOURCE_BY_SLUG)) {
    const sourcePath = join(sourceDir, sourceName);
    const destName = `${slug}.png`;
    const destPath = join(categoryDir, destName);
    const png = await processImage(sourcePath);
    await writeFile(destPath, png);
    keep.add(destName.toLowerCase());
    const blurHash = await blurHashFromPng(png);
    results.push({
      slug,
      imageUrl: `/categories/${destName}`,
      blurHash,
    });
    console.log(`✓ ${sourceName} → ${destName}`);
  }

  const leftover = (await readdir(categoryDir)).filter(
    (name) => name.toLowerCase().endsWith(".png") && !keep.has(name.toLowerCase()),
  );
  for (const name of leftover) {
    await unlink(join(categoryDir, name));
    console.log(`✓ removed ${name}`);
  }

  return results;
}

function buildSql(results) {
  const updates = results
    .map(
      (row) =>
        `UPDATE public.categories\n` +
        `SET image_url = ${sqlLiteral(row.imageUrl)},\n` +
        `    blur_hash = ${sqlLiteral(row.blurHash)}\n` +
        `WHERE slug = ${sqlLiteral(row.slug)};`,
    )
    .join("\n\n");

  return `-- Local transparent category images from public/categories\n${updates}\n`;
}

async function applyToDatabase(results) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  for (const row of results) {
    const { data, error } = await supabase
      .from("categories")
      .update({ image_url: row.imageUrl, blur_hash: row.blurHash })
      .eq("slug", row.slug)
      .select("slug");
    if (error) throw new Error(`${row.slug}: ${error.message}`);
    if (!data?.length) {
      console.warn(`⚠ no category row for slug ${row.slug}`);
    } else {
      console.log(`✓ database ${row.slug}`);
    }
  }
}

const results = await processAll();
const sql = buildSql(results);
await mkdir(migrationsDir, { recursive: true });
const sqlPath = join(migrationsDir, "20260820000000_category_local_images.sql");
await writeFile(sqlPath, sql, "utf8");
console.log(`✓ wrote ${sqlPath.replace(`${root}\\`, "").replace(`${root}/`, "")}`);
await applyToDatabase(results);
console.log("✓ category images applied");
