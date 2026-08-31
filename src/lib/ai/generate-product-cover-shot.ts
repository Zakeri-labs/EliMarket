import sharp from "sharp";
import { getOpenAiApiKey } from "@/lib/ai/openai-client";
import {
  AI_IMAGE_GENERATION_ENABLED,
  AI_IMAGE_MODEL,
  AI_IMAGE_QUALITY,
  AI_IMAGE_STYLE_BLOCK,
} from "@/lib/ai/ai-config";

// This regenerates the product's pixels (unlike enhance-product-photo.ts),
// so it carries a real, demonstrated risk: even with explicit "do not alter
// text/labels" instructions, fine print on the package can still come out
// wrong (tested against real Persian-labeled packaging — the large title
// survived, small nutrition-fact-style text did not). Every image this
// produces MUST be treated as "ai-generated" needing admin verification
// before the product goes live — never auto-trusted like the deterministic
// enhance-product-photo.ts output.
//
// Also tested: passing n>1 with one shared prompt (asking the model to
// produce "Image 1 / Image 2 / Image 3" itself) just returns near-identical
// samples — the model has no notion of "which slot" it's filling. Separate
// calls with their own tailored prompt (below) is the only way that
// actually varies anything. Even then, gpt-image-1's edit endpoint stays
// strongly anchored to the input photo's camera angle: asking for a
// "three-quarter view" or "side angle" reliably does NOT rotate the
// product — only lighting mood, background tone, and framing tightness
// actually vary between calls. Prompt wording still asks for the angle
// change (in case the model improves), but callers/UI should not promise
// genuinely different angles from a single source photo.
const FIDELITY_RULES =
  "You are an expert AI commercial product photographer specializing in high-end e-commerce product photography. " +
  "The uploaded product image is the PRIMARY SOURCE OF TRUTH. Carefully analyze it and preserve: exact product shape, proportions, dimensions, geometry, colors, materials, surface texture, packaging, logos, brand identity, labels, printed text, buttons/handles/caps/components. " +
  "Do not redesign, improve, simplify, modernize, or reinterpret the product. Do not invent missing features, change its color or packaging, replace its logos, or add accessories not present in the reference. The generated product must clearly be the SAME physical product shown in the uploaded image. " +
  "Never generate a cartoon, illustration, 3D render, CGI look, deformed product, incorrect proportions, extra or missing components, fake logos/text/labels, people, hands, props, watermarks, or promotional text — the result must be photorealistic.";

// Every prompt ends with the shared, config-driven style mandate
// (AI_IMAGE_STYLE_BLOCK): light-grey studio backdrop + studio lighting +
// soft contact shadow + photoreal. Edit those clauses in ai-config.ts.
function coverPrompt(title: string) {
  return `${FIDELITY_RULES}

Create the PRIMARY, standard e-commerce cover image of this product.
Position: product prominently centered, fully visible and completely inside the frame, balanced comfortable negative space around it.
Camera: straightforward, product-focused angle, natural perspective, sharp details, minimal distortion, high-end studio camera look.

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

function secondaryPrompt(title: string) {
  return `${FIDELITY_RULES}

Create a SECOND professional photograph of this SAME product for a secondary product-detail view — vary the camera angle or composition from a plain straight-on shot (three-quarter view, slight side angle, or slightly elevated angle — whichever best presents this specific product), while the product itself stays completely identical (shape, color, materials, packaging, logo, text, components, proportions).

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

function marketingPrompt(title: string) {
  return `${FIDELITY_RULES}

Create a THIRD, premium marketing-style commercial photograph of this SAME product — a more visually appealing composition than a plain catalog shot (elegant three-quarter framing, close but complete product framing), while the product itself stays completely identical (shape, color, materials, packaging, logo, text, components, proportions). No lifestyle scene, no people, hands, props, or watermarks.

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

const SHOT_PROMPTS = [coverPrompt, secondaryPrompt, marketingPrompt];

async function requestCoverShot(png: Buffer, key: string, prompt: string): Promise<Buffer | null> {
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
 * Generate up to `count` premium studio-quality shots of a product via AI —
 * shot 1 is always the standard fixed cover framing, shots 2+ ask for a
 * different angle/composition/lighting mood for variety (see file header:
 * lighting/background/framing genuinely vary; true camera-angle rotation
 * does not, since gpt-image-1's edit endpoint stays anchored to the input
 * photo's angle). Each shot is its own separate API call with its own
 * tailored prompt — passing n>1 with one shared prompt was tested and just
 * returns near-duplicate samples. Best-effort: returns fewer than requested
 * (possibly empty) on failure or when no key is configured, so callers must
 * fall back to the deterministic enhancer and must mark any result as
 * "ai-generated" (never auto-published) since fine print can still come out
 * wrong.
 */
export async function generateProductCoverShots(input: {
  bytes: Buffer;
  mime: string;
  title: string;
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

  const title = input.title.trim() || "grocery product";
  const count = Math.max(1, Math.min(input.count ?? 1, SHOT_PROMPTS.length));
  const prompts = SHOT_PROMPTS.slice(0, count).map((build) => build(title));

  const results = await Promise.all(prompts.map((prompt) => requestCoverShot(png, key, prompt)));
  return results.filter((buffer): buffer is Buffer => buffer != null);
}
