import sharp from "sharp";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";
import {
  AI_IMAGE_GENERATION_ENABLED,
  AI_IMAGE_MODEL,
  AI_IMAGE_QUALITY,
  AI_IMAGE_STYLE_BLOCK,
} from "@/lib/ai/ai-config";

// Unlike enhance-product-photo.ts (which never touches pixels), these prompts
// deliberately generate brand-new supplementary images. They never ask the
// model to render or preserve any printed text/logo — only the product's
// contents/food itself — which sidesteps the text-hallucination failure mode
// that made regenerating the labeled package itself unsafe. Callers must
// still mark these as AI-generated so an admin can verify accuracy before
// publishing, since the model can still get color/shape/texture wrong.
// Shared, config-driven mandate: light-grey studio backdrop + studio
// lighting + soft contact shadow + photoreal. Edit in ai-config.ts.
const STUDIO_STYLE = `${AI_IMAGE_STYLE_BLOCK}
Framing: generous empty margin around the subject — it should not fill the whole frame.`;

const CONTEXT_SHOT_PROMPTS = [
  `Create a NEW product photo for a grocery catalog showing the actual contents of this package (the food/drink/treats itself) placed or poured next to the package — for example in a glass, bowl, or small pile beside it. Do not render any readable text, brand name, or label wording anywhere in the image; keep the package shape plain and unlabeled. Keep the color, shape, and texture of the contents realistic and consistent with what this actual product looks like. ${STUDIO_STYLE}`,
  `Create a NEW close-up product photo showing ONLY the actual contents of this package (the food/drink/treats itself, not the package) — a close-up that reveals its real texture and color. Do not render any readable text, brand name, logo, or packaging anywhere in the image. ${STUDIO_STYLE}`,
];

function buildEditForm(png: Buffer, prompt: string) {
  const form = new FormData();
  form.append("image", new Blob([new Uint8Array(png)], { type: "image/png" }), "product.png");
  form.append("prompt", prompt);
  form.append("model", AI_IMAGE_MODEL);
  form.append("size", "1024x1024");
  form.append("quality", AI_IMAGE_QUALITY);
  return form;
}

async function requestShot(png: Buffer, key: string, prompt: string): Promise<Buffer | null> {
  try {
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}` },
      body: buildEditForm(png, prompt),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: Array<{ b64_json?: string; url?: string }> };
    const first = json.data?.[0];
    if (first?.b64_json) return Buffer.from(first.b64_json, "base64");
    if (first?.url) {
      const imgRes = await fetch(first.url);
      if (!imgRes.ok) return null;
      return Buffer.from(await imgRes.arrayBuffer());
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Generate up to `count` brand-new, AI-generated supplementary catalog shots
 * (contents poured/placed next to the package, close-up of contents) from a
 * single product photo. Best-effort: returns fewer than requested (possibly
 * empty) when no key is configured or a request fails, so callers should
 * treat these as optional extras, not a guarantee, and label them for admin
 * review since — unlike enhance-product-photo.ts — these ARE AI-generated.
 */
export async function generateProductContextShots(input: {
  bytes: Buffer;
  mime: string;
  count?: number;
}): Promise<Buffer[]> {
  const key = getOpenAiApiKey();
  if (!key || !AI_IMAGE_GENERATION_ENABLED) return [];

  const png = await sharp(input.bytes)
    .rotate()
    .resize(1024, 1024, {
      fit: "inside",
      withoutEnlargement: true,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer();

  const count = Math.max(1, Math.min(input.count ?? 1, CONTEXT_SHOT_PROMPTS.length));
  const prompts = CONTEXT_SHOT_PROMPTS.slice(0, count);

  const results = await Promise.all(prompts.map((prompt) => requestShot(png, key, prompt)));
  return results.filter((buffer): buffer is Buffer => buffer != null);
}
