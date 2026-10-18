import { getAiConfig } from "@/lib/ai/ai-config";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";

/**
 * Cheap vision pass (text model, a fraction of a cent) that names everything in
 * the photo that is NOT the product itself — title banners, captions, stickers,
 * watermarks, photographer/website logos, price tags. The image-edit model
 * ignores a generic "remove overlays" instruction much more often than a
 * concrete one ("remove the green banner at the top and the round logo at the
 * bottom"), so the result is injected into the image prompt.
 *
 * Best-effort: returns "" on any failure, and the image prompt then falls back
 * to its generic wording.
 */
export async function describeOverlays(input: { bytes: Buffer; mime: string }): Promise<string> {
  const key = getOpenAiApiKey();
  if (!key) return "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: (await getAiConfig()).visionModel,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You inspect product photos for an online grocery store. Reply with JSON only: {"overlays": string[]}.',
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "List every element in this photo that is NOT part of the physical product itself and was added on top of the picture or sits around it: text banners/title strips, captions, stickers, price tags, watermarks, website or photographer logos, borders, and any table/surface/background objects. For each, give a short concrete description with its colour, position in the frame and any visible words (e.g. \"dark green banner with white Persian text at the top centre\", \"small round logo with the word MIVERY at the bottom centre\", \"wooden table surface\"). Do NOT list text that is printed on the product's own packaging or label. If there is nothing, return an empty list.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${input.mime};base64,${input.bytes.toString("base64")}` },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error(`[describe-overlays] OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return "";
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { overlays?: unknown };
    const list = Array.isArray(parsed.overlays)
      ? parsed.overlays.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : [];
    return list.slice(0, 8).join("; ");
  } catch (err) {
    console.error("[describe-overlays] failed:", err instanceof Error ? err.message : err);
    return "";
  }
}

/**
 * Vision pass that READS the packaging text off the real photo, verbatim, so the image prompt can
 * pin the label to what is actually printed (image models otherwise paraphrase or invent label
 * text, especially Arabic/Persian). Returns "" when the product has no printed text or on any
 * failure — the prompt then relies on its generic label-fidelity wording.
 */
export async function transcribeLabelText(input: { bytes: Buffer; mime: string }): Promise<string> {
  const key = getOpenAiApiKey();
  if (!key) return "";
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
      body: JSON.stringify({
        model: (await getAiConfig()).visionModel,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              'You transcribe the printed text on product packaging for an online grocery store. Reply with JSON only: {"lines": string[]}.',
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text:
                  "Read the text that is physically PRINTED on the product's own packaging/label in this photo and return it exactly as written: one entry per visible line or text block, in reading order, in its ORIGINAL script and spelling (Arabic, Persian, English, numbers, units). Do not translate, correct, complete or guess. Skip anything unreadable. Ignore text that was added on top of the photo (banners, captions, watermarks, price tags). If the product has no printed text, return an empty list.",
              },
              {
                type: "image_url",
                image_url: { url: `data:${input.mime};base64,${input.bytes.toString("base64")}` },
              },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      console.error(`[transcribe-label] OpenAI ${res.status}: ${(await res.text()).slice(0, 200)}`);
      return "";
    }
    const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const parsed = JSON.parse(json.choices?.[0]?.message?.content ?? "{}") as { lines?: unknown };
    const lines = Array.isArray(parsed.lines)
      ? parsed.lines.filter((l): l is string => typeof l === "string" && l.trim().length > 0)
      : [];
    return lines.slice(0, 20).map((l) => `"${l.trim()}"`).join(" / ");
  } catch (err) {
    console.error("[transcribe-label] failed:", err instanceof Error ? err.message : err);
    return "";
  }
}
