import { getOpenAiApiKey } from "@/lib/ai/openai-client";
import { AI_WEB_IMAGE_SEARCH_ENABLED, AI_WEB_SEARCH_MODEL } from "@/lib/ai/ai-config";

export type WebImageCandidate = {
  url: string;
  source: string;
};

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

/**
 * Best-effort web image search via OpenAI's web_search tool. Returns direct
 * image URLs the model actually found while searching — never fabricated.
 * Caller must still fetch + verify each URL before trusting it, since search
 * results can match the wrong variant/packaging of a product.
 */
export async function searchProductImagesWithOpenAi(input: {
  query: string;
  count?: number;
}): Promise<WebImageCandidate[]> {
  const key = getOpenAiApiKey();
  if (!AI_WEB_IMAGE_SEARCH_ENABLED) return [];
  if (!key || !input.query.trim()) {
    console.error(`[web-image-search] skipped: ${!key ? "no OPENAI_API_KEY" : "empty query"}`);
    return [];
  }

  const count = Math.max(1, Math.min(input.count ?? 3, 5));

  let res: Response;
  try {
    res = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: AI_WEB_SEARCH_MODEL,
        tools: [{ type: "web_search_preview" }],
        input: [
          {
            role: "system",
            content:
              "You search the public web for real product photos and report only direct image file URLs you actually found. Never invent or guess a URL.",
          },
          {
            role: "user",
            content: `Search the web for real, official product photos of this exact grocery product: "${input.query}".
I need photos of this EXACT product — same brand, same variant, same package size — not a similar or different item, not a generic stock photo of a different brand.

Return JSON only, no prose:
{"images":[{"url":"https://.../direct-image-file.jpg","source":"the site domain it came from"}]}

Rules:
- At most ${count} results.
- Only direct links to image files (.jpg/.jpeg/.png/.webp) found on real retailer, brand, or grocery-listing pages.
- If you cannot find genuinely matching photos, return {"images":[]}. Do not substitute an unrelated product.`,
          },
        ],
      }),
    });
  } catch (err) {
    console.error("[web-image-search] request threw:", err instanceof Error ? err.message : err);
    return [];
  }

  if (!res.ok) {
    console.error(`[web-image-search] ${AI_WEB_SEARCH_MODEL} ${res.status}: ${(await res.text()).slice(0, 250)}`);
    return [];
  }

  const json = (await res.json().catch(() => null)) as {
    output?: Array<{
      type?: string;
      content?: Array<{ type?: string; text?: string }>;
    }>;
  } | null;
  if (!json) return [];

  const text = json.output
    ?.filter((item) => item.type === "message")
    .flatMap((item) => item.content ?? [])
    .filter((part) => part.type === "output_text")
    .map((part) => part.text ?? "")
    .join("\n");
  if (!text) return [];

  const parsed = parseJsonObject(text);
  const images = parsed?.images;
  if (!Array.isArray(images)) return [];

  return images
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const url = asString(row.url);
      if (!url || !/^https?:\/\//i.test(url)) return null;
      return { url, source: asString(row.source) || new URL(url).hostname };
    })
    .filter((item): item is WebImageCandidate => item != null)
    .slice(0, count);
}
