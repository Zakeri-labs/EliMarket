/**
 * Fill in / repair the per-language product names and descriptions in Supabase.
 *
 * A product field is "bad" when it is empty or written in the wrong language
 * (e.g. name_en containing Persian, name_ar containing Persian letters, name_fa
 * with no Persian/Arabic script). Bad fields are translated from the best source
 * text the product has; good fields are never touched.
 *
 * Safety:
 *  - Default is a DRY RUN: it lists what would change (and calls no AI, writes nothing).
 *  - --commit translates with OpenAI and UPDATES only the bad fields. The previous
 *    values are saved to scripts/_restyle-backup/translate-<stamp>.json first.
 *
 * Run:
 *   node --env-file=.env.local scripts/translate-db-products.mjs            # preview
 *   node --env-file=.env.local scripts/translate-db-products.mjs --commit   # apply
 *   append slugs to limit:  ... --commit milk bananas
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const openAiKey = process.env.OPENAI_API_KEY?.trim();
if (!sbUrl || !sbKey) {
  console.error("Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (use --env-file=.env.local).");
  process.exit(1);
}
const sb = createClient(sbUrl, sbKey, { auth: { persistSession: false } });

const args = process.argv.slice(2);
const commit = args.includes("--commit");
const onlySlugs = args.filter((a) => !a.startsWith("--"));
const MODEL = "gpt-4o-mini";

const hasArabicScript = (t) => /[؀-ۿݐ-ݿࢠ-ࣿﭐ-﷿ﹰ-﻿]/.test(t);
const PERSIAN_LETTERS = /[پچژگکی]/;
const fits = {
  fa: (t) => hasArabicScript(t),
  ar: (t) => hasArabicScript(t) && !PERSIAN_LETTERS.test(t),
  en: (t) => !hasArabicScript(t),
};
const LANG_NAME = { fa: "Persian (Farsi)", ar: "Arabic", en: "English" };

function badFields(p) {
  const bad = [];
  for (const kind of ["name", "description"]) {
    for (const lang of ["fa", "ar", "en"]) {
      const value = (p[`${kind}_${lang}`] ?? "").trim();
      if (!value) {
        // Only translate a description when the product has some description at all.
        if (kind === "description" && !sourceText(p, "description")) continue;
        bad.push(`${kind}_${lang}`);
      } else if (!fits[lang](value)) bad.push(`${kind}_${lang}`);
    }
  }
  return bad;
}

/** Best existing text to translate from: any non-empty field, correct-language ones first. */
function sourceText(p, kind) {
  const candidates = [];
  for (const lang of ["en", "fa", "ar"]) {
    const v = (p[`${kind}_${lang}`] ?? "").trim();
    if (v && fits[lang](v)) candidates.push(v);
  }
  const legacy = (p[kind] ?? "").trim();
  if (legacy) candidates.push(legacy);
  for (const lang of ["en", "fa", "ar"]) {
    const v = (p[`${kind}_${lang}`] ?? "").trim();
    if (v) candidates.push(v);
  }
  return candidates[0] ?? "";
}

async function translate(p, bad) {
  const wanted = bad.map((f) => `${f} (${LANG_NAME[f.slice(-2)]})`);
  const body = {
    model: MODEL,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You translate supermarket product names and short descriptions for an online store in Oman. " +
          "Return ONLY a JSON object with exactly the requested keys. Keep brand names, numbers and units " +
          "(kg, g, ml, L) as they are, using natural supermarket wording in each language. Names are short " +
          "product titles, not sentences. Arabic must be standard Arabic (no Persian letters); Persian must be " +
          "natural Persian. Do not add claims that are not in the source.",
      },
      {
        role: "user",
        content: JSON.stringify({
          source_name: sourceText(p, "name") || p.slug,
          source_description: sourceText(p, "description"),
          category_hint: p.slug,
          return_keys: wanted,
        }),
      },
    ],
  };
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${openAiKey}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
  const json = JSON.parse((await res.json()).choices[0].message.content);
  const out = {};
  for (const f of bad) {
    const v = typeof json[f] === "string" ? json[f].trim() : "";
    if (v && fits[f.slice(-2)](v)) out[f] = v;
  }
  return out;
}

const { data: products, error } = await sb
  .from("products")
  .select("id, slug, name, name_fa, name_ar, name_en, description, description_fa, description_ar, description_en")
  .order("slug");
if (error) {
  console.error(error.message);
  process.exit(1);
}

const todo = products
  .filter((p) => onlySlugs.length === 0 || onlySlugs.includes(p.slug))
  .map((p) => ({ p, bad: badFields(p) }))
  .filter((x) => x.bad.length > 0);

console.log(`${products.length} products, ${todo.length} need fixing.`);
for (const { p, bad } of todo) console.log(`  ${p.slug}: ${bad.join(", ")}`);

if (!commit) {
  console.log("\nDry run only. Re-run with --commit to translate and update.");
  process.exit(0);
}
if (!openAiKey) {
  console.error("OPENAI_API_KEY is not set; cannot translate.");
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupDir = join("scripts", "_restyle-backup");
await mkdir(backupDir, { recursive: true });
await writeFile(
  join(backupDir, `translate-${stamp}.json`),
  JSON.stringify(todo.map(({ p }) => p), null, 2),
);
console.log(`Backed up current values to ${join(backupDir, `translate-${stamp}.json`)}`);

let ok = 0;
for (const { p, bad } of todo) {
  try {
    const patch = await translate(p, bad);
    if (Object.keys(patch).length === 0) {
      console.log(`  ${p.slug}: nothing usable returned, skipped`);
      continue;
    }
    const { error: upErr } = await sb.from("products").update(patch).eq("id", p.id);
    if (upErr) throw new Error(upErr.message);
    ok++;
    console.log(`  ${p.slug}: updated ${Object.keys(patch).join(", ")}`);
  } catch (e) {
    console.error(`  ${p.slug}: FAILED ${e.message}`);
  }
}
console.log(`Done: ${ok}/${todo.length} products updated.`);
