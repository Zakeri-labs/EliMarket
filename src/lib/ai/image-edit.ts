import sharp from "sharp";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";
import { getGeminiApiKey } from "@/lib/ai/gemini-client";
import {
  AI_IMAGE_MODEL,
  AI_IMAGE_PROVIDER,
  AI_IMAGE_QUALITY,
} from "@/lib/ai/ai-config";

/**
 * Provider-agnostic "edit this product photo per `prompt`" call. Returns a
 * normalised PNG (≤1024²) or null on any failure / missing key, so every
 * caller can fall back to the deterministic sharp pipeline.
 *
 * Default backend is Gemini 2.5 Flash Image ("nano banana") — it keeps the
 * real label/brand text far better than gpt-image-1 during an edit. Set
 * AI_IMAGE_PROVIDER=openai to use gpt-image-1 / gpt-image-1-mini instead.
 */
export async function editProductImage(png: Buffer, prompt: string): Promise<Buffer | null> {
  const raw =
    AI_IMAGE_PROVIDER === "openai"
      ? await editWithOpenAi(png, prompt)
      : await editWithGemini(png, prompt);
  if (!raw) return null;
  try {
    return await sharp(raw)
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .png({ compressionLevel: 9, adaptiveFiltering: true })
      .toBuffer();
  } catch {
    return null;
  }
}

async function editWithGemini(png: Buffer, prompt: string): Promise<Buffer | null> {
  const key = getGeminiApiKey();
  if (!key) {
    console.error("[image-edit] AI_IMAGE_PROVIDER=gemini but no GEMINI_API_KEY set");
    return null;
  }
  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${AI_IMAGE_MODEL}:generateContent?key=${encodeURIComponent(key)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { inlineData: { mimeType: "image/png", data: png.toString("base64") } },
              ],
            },
          ],
          generationConfig: { responseModalities: ["TEXT", "IMAGE"], temperature: 0.3 },
        }),
      },
    );
    if (!res.ok) {
      console.error(`[image-edit] Gemini ${AI_IMAGE_MODEL} ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const json = (await res.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ inlineData?: { data?: string }; inline_data?: { data?: string } }> };
        finishReason?: string;
      }>;
      promptFeedback?: unknown;
    };
    const parts = json.candidates?.[0]?.content?.parts ?? [];
    for (const part of parts) {
      const data = part.inlineData?.data ?? part.inline_data?.data;
      if (data) return Buffer.from(data, "base64");
    }
    console.error(
      `[image-edit] Gemini returned no image (finishReason=${json.candidates?.[0]?.finishReason}) ` +
        JSON.stringify(json.promptFeedback ?? {}).slice(0, 200),
    );
    return null;
  } catch (err) {
    console.error("[image-edit] Gemini request threw:", err instanceof Error ? err.message : err);
    return null;
  }
}

async function editWithOpenAi(png: Buffer, prompt: string): Promise<Buffer | null> {
  const key = getOpenAiApiKey();
  if (!key) {
    console.error("[image-edit] AI_IMAGE_PROVIDER=openai but no OPENAI_API_KEY set");
    return null;
  }
  try {
    const form = new FormData();
    form.append("image", new Blob([new Uint8Array(png)], { type: "image/png" }), "product.png");
    form.append("prompt", prompt);
    form.append("model", AI_IMAGE_MODEL);
    form.append("size", "1024x1024");
    form.append("quality", AI_IMAGE_QUALITY);

    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: form,
    });
    if (!res.ok) {
      console.error(`[image-edit] OpenAI ${AI_IMAGE_MODEL} ${res.status}: ${(await res.text()).slice(0, 300)}`);
      return null;
    }
    const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = json.data?.[0];
    if (first?.b64_json) return Buffer.from(first.b64_json, "base64");
    if (first?.url) {
      const imgRes = await fetch(first.url);
      return imgRes.ok ? Buffer.from(await imgRes.arrayBuffer()) : null;
    }
    return null;
  } catch {
    return null;
  }
}
