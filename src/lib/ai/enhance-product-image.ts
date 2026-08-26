import sharp from "sharp";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";

/**
 * Improve a product photo with OpenAI Images edits when available.
 * Falls back to null so callers can use local background removal.
 */
export async function enhanceProductImageWithOpenAi(input: {
  bytes: Buffer;
  mime: string;
}): Promise<Buffer | null> {
  const key = getOpenAiApiKey();
  if (!key) return null;

  // API prefers PNG under ~4MB; normalize size first.
  const png = await sharp(input.bytes)
    .rotate()
    .resize(1024, 1024, {
      fit: "inside",
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(png)], { type: "image/png" }),
    "product.png",
  );
  form.append(
    "prompt",
    [
      "Enhance this grocery product photo for an online supermarket catalog.",
      "Keep the exact same product and packaging text readable.",
      "Clean studio look: soft even lighting, sharp details, remove clutter and dirty background.",
      "Place the product on a clean seamless light/white background or transparent studio backdrop.",
      "Do not invent logos, brands, or extra products.",
    ].join(" "),
  );
  form.append("model", "gpt-image-1");
  form.append("size", "1024x1024");

  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
    },
    body: form,
  });

  if (!res.ok) {
    // Older accounts / restricted orgs may reject gpt-image-1 — signal fallback.
    return null;
  }

  const json = (await res.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
  };
  const first = json.data?.[0];
  if (first?.b64_json) {
    return Buffer.from(first.b64_json, "base64");
  }
  if (first?.url) {
    const imgRes = await fetch(first.url);
    if (!imgRes.ok) return null;
    return Buffer.from(await imgRes.arrayBuffer());
  }
  return null;
}
