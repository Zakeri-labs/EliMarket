import { STORE_LOCATION } from "@/config/store-location";
import { buildBlogPostStub, type BlogPostDraftI18n } from "@/lib/ai/blog-post-stub";
import { openAiChatJson } from "@/lib/ai/openai-client";

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * Draft a short blog post in FA, AR and EN. Each language is written natively
 * (not translated from the others). Falls back to a deterministic stub when no
 * OpenAI key is configured or the call returns nothing usable.
 */
export async function generateBlogPostDraftWithOpenAi(input: {
  topic: string;
}): Promise<BlogPostDraftI18n | null> {
  const fallback = buildBlogPostStub(input.topic);
  const { name, district, city, country, coordinates, googleMapsUrl, deliveryArea } =
    STORE_LOCATION;

  const parsed = await openAiChatJson({
    system:
      "You write short, friendly blog posts for a neighbourhood supermarket's website. Factual and modest — no invented landmarks, phone numbers, opening hours, prices or certifications. Return JSON only.",
    user: `Write a blog post on this topic: "${input.topic}".

Store facts you may use:
- Name: ${name}
- Location: ${district.en}, in ${city.en}, ${country.en}
- Exact map pin: ${googleMapsUrl} (coordinates ${coordinates.lat}, ${coordinates.lng})
- Delivery reach: ${deliveryArea.en}
- Free delivery over OMR 5.000

Return JSON with these keys (all required):
{
  "title_fa": "headline in Persian",
  "title_ar": "headline in Arabic",
  "title_en": "headline in English",
  "excerpt_fa": "one-sentence summary in Persian",
  "excerpt_ar": "one-sentence summary in Arabic",
  "excerpt_en": "one-sentence summary in English",
  "body_fa": "3-5 short paragraphs in Persian",
  "body_ar": "3-5 short paragraphs in Arabic",
  "body_en": "3-5 short paragraphs in English"
}

Rules:
- Each language is written independently for a native reader, not translated.
- Plain text only. Separate paragraphs with a blank line. A line starting with "## " is a sub-heading.
- Keep each language self-contained (do not mix scripts).
- If you mention the location, keep it to the facts above.`,
    temperature: 0.5,
  });

  if (!parsed) return null;

  const draft: BlogPostDraftI18n = {
    title_fa: asString(parsed.title_fa) || fallback.title_fa,
    title_ar: asString(parsed.title_ar) || fallback.title_ar,
    title_en: asString(parsed.title_en) || fallback.title_en,
    excerpt_fa: asString(parsed.excerpt_fa) || fallback.excerpt_fa,
    excerpt_ar: asString(parsed.excerpt_ar) || fallback.excerpt_ar,
    excerpt_en: asString(parsed.excerpt_en) || fallback.excerpt_en,
    body_fa: asString(parsed.body_fa) || fallback.body_fa,
    body_ar: asString(parsed.body_ar) || fallback.body_ar,
    body_en: asString(parsed.body_en) || fallback.body_en,
  };

  if (!draft.body_fa && !draft.body_ar && !draft.body_en) return null;
  return draft;
}
