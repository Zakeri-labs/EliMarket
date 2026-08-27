import {
  buildProductDescriptionStub,
  type ProductDescriptionsI18n,
} from "@/lib/ai/product-description-stub";
import { openAiChatJson } from "@/lib/ai/openai-client";

export type GeneratedProductNameAndDescriptions = ProductDescriptionsI18n & {
  name_ar: string;
  name_en: string;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateProductDescriptionsWithOpenAi(input: {
  name: string;
  category?: string;
}): Promise<GeneratedProductNameAndDescriptions | null> {
  const fallback = buildProductDescriptionStub(input);
  const parsed = await openAiChatJson({
    system:
      "You write grocery product listing copy for Hills Eli Mart (Muscat/Oman supermarket). Return JSON only.",
    user: `Given this Persian product name, produce its Arabic and English sellable product names, plus short store descriptions in all three languages.
Product name (Persian): ${input.name}
Category: ${input.category || "general grocery"}

Return JSON:
{
  "name_ar": "the same product's sellable name in Arabic (a real Arabic product name, not a transliteration)",
  "name_en": "the same product's sellable name in English",
  "description_fa": "2-3 sentences in Persian",
  "description_ar": "2-3 sentences in Arabic (independently written ad copy, not a translation of the Persian text)",
  "description_en": "2-3 sentences in English (independently written ad copy, not a translation of the other two)"
}

Rules:
- Sound natural for an online grocery listing
- Mention freshness/quality/use when appropriate
- No medical claims, no invented certifications
- Keep each language self-contained (do not mix scripts)`,
    temperature: 0.45,
  });

  if (!parsed) return null;

  const description_fa = asString(parsed.description_fa) || fallback.description_fa;
  const description_ar = asString(parsed.description_ar) || fallback.description_ar;
  const description_en = asString(parsed.description_en) || fallback.description_en;
  const name_ar = asString(parsed.name_ar) || input.name;
  const name_en = asString(parsed.name_en) || input.name;

  if (!description_fa && !description_ar && !description_en) return null;

  return { description_fa, description_ar, description_en, name_ar, name_en };
}
