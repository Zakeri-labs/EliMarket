import { slugifyProductName } from "@/lib/products/slug";
import { buildProductDescriptionStub } from "@/lib/ai/product-description-stub";

export type VisionCatalogDraft = {
  name: string;
  slug: string;
  description_fa: string;
  description_ar: string;
  description_en: string;
  features: { label: string; value: string }[];
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

function asFeatures(value: unknown): { label: string; value: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as { label?: unknown; value?: unknown };
      const label = asString(row.label);
      const val = asString(row.value);
      if (!label || !val) return null;
      return { label, value: val };
    })
    .filter((item): item is { label: string; value: string } => item != null)
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
  return `You are a grocery catalog assistant for EliMarket, a supermarket in Iran.
Look at the product photo(s) and return JSON only with:
{
  "name": "sellable product title, preferably Persian if the pack is Persian, otherwise the common store name",
  "slug": "english-kebab-case-slug",
  "description_fa": "2-3 sentence Persian store description",
  "description_ar": "2-3 sentence Arabic store description",
  "description_en": "2-3 sentence English store description",
  "category_name": "best matching category from this list or empty: ${categoryList}",
  "features": [{"label":"وزن","value":"..."}]
}
Hint name: ${input.hintName || "none"}
Hint category: ${input.categoryName || "none"}
Do not invent medical claims. Be specific about what is visible on the pack.`;
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
  try {
    parsed = await analyzeWithGemini(payloads, prompt);
  } catch {
    parsed = null;
  }
  if (!parsed) {
    try {
      parsed = await analyzeWithOpenAi(payloads, prompt);
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
      name: fallbackName,
      slug: slugifyProductName(fallbackName),
      ...stub,
      features: [],
      usedModel: false,
    };
  }

  const name = asString(parsed.name) || fallbackName;
  const slug =
    slugifyProductName(asString(parsed.slug) || asString(parsed.name_en) || name);
  return {
    name,
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
