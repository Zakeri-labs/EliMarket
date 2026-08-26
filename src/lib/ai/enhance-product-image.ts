import sharp from "sharp";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";

const BASE_INSTRUCTIONS =
  "Enhance this grocery product photo for an online supermarket catalog. " +
  "This must stay a real, authentic product photo: preserve the exact product, its shape, proportions, colors, printed label text, logos, and packaging design pixel-for-pixel in content — do not invent, alter, remove, retouch, or add any text, logo, claim, or design element on the pack, and do not turn it into an illustration or 3D render. " +
  "Only improve the photography itself: sharpen focus, correct exposure/white balance, remove dust or clutter, and present the product cleanly.";

// Distinct, deliberate compositions so multiple generated variants differ from
// each other (framing/background/lighting) rather than relying on random
// same-prompt sampling, while every variant still obeys BASE_INSTRUCTIONS.
const VARIANT_COMPOSITIONS = [
  "Composition: straight-on studio front view, product centered on a clean seamless white background, soft even lighting, subtle shadow beneath it.",
  "Composition: three-quarter angle shot on a light neutral gradient background, gentle directional lighting for a premium catalog look.",
  "Composition: closer framing that fills more of the shot, still on a clean light backdrop, sharp focus on the label so its text stays legible.",
];

function buildEditForm(png: Buffer, prompt: string) {
  const form = new FormData();
  form.append(
    "image",
    new Blob([new Uint8Array(png)], { type: "image/png" }),
    "product.png",
  );
  form.append("prompt", prompt);
  form.append("model", "gpt-image-1");
  form.append("size", "1024x1024");
  return form;
}

async function requestEdit(png: Buffer, key: string, prompt: string): Promise<Buffer | null> {
  const res = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}` },
    body: buildEditForm(png, prompt),
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

/**
 * Generate up to `count` distinct, authenticity-preserving catalog variants
 * of a product photo via OpenAI Images edits. Returns as many as succeeded
 * (possibly fewer than requested, or an empty array when no key is
 * configured or every request failed) so callers can fall back gracefully.
 */
export async function enhanceProductImageVariants(input: {
  bytes: Buffer;
  mime: string;
  count?: number;
}): Promise<Buffer[]> {
  const key = getOpenAiApiKey();
  if (!key) return [];

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

  const count = Math.max(1, Math.min(input.count ?? 1, VARIANT_COMPOSITIONS.length));
  const prompts = VARIANT_COMPOSITIONS.slice(0, count).map(
    (composition) => `${BASE_INSTRUCTIONS} ${composition}`,
  );

  const results = await Promise.all(prompts.map((prompt) => requestEdit(png, key, prompt)));
  return results.filter((buffer): buffer is Buffer => buffer != null);
}

/**
 * Improve a single product photo with OpenAI Images edits when available.
 * Falls back to null so callers can use local background removal.
 */
export async function enhanceProductImageWithOpenAi(input: {
  bytes: Buffer;
  mime: string;
}): Promise<Buffer | null> {
  const variants = await enhanceProductImageVariants({ ...input, count: 1 });
  return variants[0] ?? null;
}
