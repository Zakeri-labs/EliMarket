import { slugifyProductName } from "@/lib/products/slug";
import { buildProductDescriptionStub } from "@/lib/ai/product-description-stub";
import type { ProductFeatureInput } from "@/app/_types/database.types";

export type VisionCatalogDraft = {
  name_fa: string;
  name_ar: string;
  name_en: string;
  slug: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  features: ProductFeatureInput[];
  suggestedCategoryName?: string;
  usedModel: boolean;
};

type CategoryHint = { id: string; name: string };

function parseJsonObject(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(trimmed.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function asFeatures(value: unknown): ProductFeatureInput[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const label_fa = asString(row.label_fa);
      const value_fa = asString(row.value_fa);
      if (!label_fa || !value_fa) return null;
      return {
        label_fa,
        label_ar: asString(row.label_ar) || label_fa,
        label_en: asString(row.label_en) || label_fa,
        value_fa,
        value_ar: asString(row.value_ar) || value_fa,
        value_en: asString(row.value_en) || value_fa,
      };
    })
    .filter((item): item is ProductFeatureInput => item != null)
    .slice(0, 8);
}

function promptFor(input: {
  hintName?: string;
  categoryName?: string;
  categories: CategoryHint[];
}) {
  const categoryList = input.categories
    .slice(0, 20)
    .map((c) => c.name)
    .join(", ");
  return `You are a grocery catalog copywriter for EliMarket, a supermarket in Iran/Oman.
Look closely at the product photo(s), especially the label/packaging text (brand, ingredients, net weight, claims like organic/halal/sugar-free, usage), and return JSON only with:
{
  "name_fa": "sellable product title in Persian",
  "name_ar": "the same product's sellable title in Arabic (a real Arabic product name, not a transliteration of the Persian one)",
  "name_en": "the same product's sellable title in English",
  "slug": "english-kebab-case-slug derived from name_en",
  "description_fa": "persuasive 2-4 sentence marketing/ad copy in Persian, written natively for a Persian shopper, based on what you actually read on the label",
  "description_ar": "persuasive 2-4 sentence marketing/ad copy in Arabic, written natively for an Arabic shopper (NOT a translation of the Persian text — phrase it the way a native Arabic ad would), based on what you actually read on the label",
  "description_en": "persuasive 2-4 sentence marketing/ad copy in English, written natively for an English shopper (NOT a translation of the other two — phrase it the way a native English ad would), based on what you actually read on the label",
  "category_name": "best matching category from this list or empty: ${categoryList}",
  "features": [
    {
      "label_fa": "spec name in Persian, e.g. وزن",
      "label_ar": "the same spec name in Arabic (not transliteration, a real Arabic word)",
      "label_en": "the same spec name in English",
      "value_fa": "spec value in Persian",
      "value_ar": "the same spec value in Arabic",
      "value_en": "the same spec value in English"
    }
  ]
}
Hint name: ${input.hintName || "none"}
Hint category: ${input.categoryName || "none"}

Rules:
- name_fa/name_ar/name_en must each be a natural, sellable product title in that language (not a transliteration or literal translation of another field) while clearly naming the same real product.
- Each of description_fa/description_ar/description_en must be independently well-written ad copy in that language, not a mechanical translation of one shared sentence — vary the wording, sentence structure, and emphasis naturally between languages while keeping the same facts.
- Do not invent medical claims or certifications that are not visible on the pack.
- features/specification must be genuinely derived from what is visible on the label (weight/volume, ingredients, brand, count, usage) — return as many as are visible, up to 8. Every feature needs all six label/value fields filled for fa, ar, and en.
- Keep each language self-contained (do not mix scripts within one field).`;
}

async function analyzeWithGemini(
  images: { mime: string; base64: string }[],
  prompt: string,
): Promise<Record<string, unknown> | null> {
  const key =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim();
  if (!key) return null;

  const parts: Array<Record<string, unknown>> = [{ text: prompt }];
  for (const image of images.slice(0, 3)) {
    parts.push({
      inlineData: { mimeType: image.mime, data: image.base64 },
    });
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts }],
        generationConfig: { temperature: 0.3, responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) return null;
  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts
    ?.map((part) => part.text ?? "")
    .join("\n");
  return text ? parseJsonObject(text) : null;
}

async function analyzeWithOpenAi(
  images: { mime: string; base64: string }[],
  prompt: string,
): Promise<Record<string, unknown> | null> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;

  const content: Array<Record<string, unknown>> = [{ type: "text", text: prompt }];
  for (const image of images.slice(0, 3)) {
    content.push({
      type: "image_url",
      image_url: { url: `data:${image.mime};base64,${image.base64}` },
    });
  }

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Return only valid JSON for a grocery product listing." },
        { role: "user", content },
      ],
    }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = json.choices?.[0]?.message?.content;
  return text ? parseJsonObject(text) : null;
}

export async function draftCatalogFromImages(input: {
  images: { mime: string; bytes: Buffer }[];
  hintName?: string;
  categoryName?: string;
  categories: CategoryHint[];
}): Promise<VisionCatalogDraft> {
  const prompt = promptFor(input);
  const payloads = input.images.slice(0, 3).map((image) => ({
    mime: image.mime,
    base64: image.bytes.toString("base64"),
  }));

  let parsed: Record<string, unknown> | null = null;
  // Prefer OpenAI when configured (user .env), then Gemini.
  try {
    parsed = await analyzeWithOpenAi(payloads, prompt);
  } catch {
    parsed = null;
  }
  if (!parsed) {
    try {
      parsed = await analyzeWithGemini(payloads, prompt);
    } catch {
      parsed = null;
    }
  }

  const fallbackName = input.hintName?.trim() || "محصول جدید";
  const stub = buildProductDescriptionStub({
    name: fallbackName,
    category: input.categoryName,
  });

  if (!parsed) {
    return {
      name_fa: fallbackName,
      name_ar: fallbackName,
      name_en: fallbackName,
      slug: slugifyProductName(fallbackName),
      ...stub,
      features: [],
      usedModel: false,
    };
  }

  const name_fa = asString(parsed.name_fa) || asString(parsed.name) || fallbackName;
  const name_ar = asString(parsed.name_ar) || name_fa;
  const name_en = asString(parsed.name_en) || name_fa;
  const slug = slugifyProductName(asString(parsed.slug) || name_en);
  return {
    name_fa,
    name_ar,
    name_en,
    slug,
    description_fa: asString(parsed.description_fa) || stub.description_fa,
    description_ar: asString(parsed.description_ar) || stub.description_ar,
    description_en: asString(parsed.description_en) || stub.description_en,
    features: asFeatures(parsed.features),
    suggestedCategoryName: asString(parsed.category_name) || undefined,
    usedModel: true,
  };
}

export function matchCategoryId(
  suggestedName: string | undefined,
  categories: CategoryHint[],
) {
  const needle = suggestedName?.trim().toLowerCase();
  if (!needle) return undefined;
  const exact = categories.find((c) => c.name.toLowerCase() === needle);
  if (exact) return exact.id;
  const partial = categories.find(
    (c) =>
      c.name.toLowerCase().includes(needle) || needle.includes(c.name.toLowerCase()),
  );
  return partial?.id;
}
