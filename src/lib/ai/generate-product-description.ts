import {
  buildProductDescriptionStub,
  type ProductDescriptionsI18n,
} from "@/lib/ai/product-description-stub";
import { openAiChatJson } from "@/lib/ai/openai-client";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateProductDescriptionsWithOpenAi(input: {
  name: string;
  category?: string;
}): Promise<ProductDescriptionsI18n | null> {
  const fallback = buildProductDescriptionStub(input);
  const parsed = await openAiChatJson({
    system:
      "You write grocery product listing copy for Hills Eli Mart (Muscat/Oman supermarket). Return JSON only.",
    user: `Write short store descriptions for this product.
Product name: ${input.name}
Category: ${input.category || "general grocery"}

Return JSON:
{
  "description_fa": "2-3 sentences in Persian",
  "description_ar": "2-3 sentences in Arabic",
  "description_en": "2-3 sentences in English"
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

  if (!description_fa && !description_ar && !description_en) return null;

  return { description_fa, description_ar, description_en };
}
