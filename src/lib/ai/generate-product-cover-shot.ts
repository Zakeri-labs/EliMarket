import sharp from "sharp";
import { editProductImage } from "@/lib/ai/image-edit";
import { normalizeStudioBackdrop } from "@/lib/images/enhance-product-photo";
import {
  AI_IMAGE_GENERATION_ENABLED,
  AI_IMAGE_STYLE_BLOCK,
} from "@/lib/ai/ai-config";

// This regenerates the product's pixels (unlike enhance-product-photo.ts),
// so it carries a real risk: an image model can still alter label text even
// when told not to. The default backend (image-edit.ts) is Gemini 2.5 Flash
// Image, which holds the real label/brand text far better than gpt-image-1 —
// but it is still best-effort, not a guarantee, especially for tiny print.
// Every image this produces MUST be treated as "ai-generated" needing admin
// verification before the product goes live — never auto-trusted like the
// deterministic enhance-product-photo.ts output.
//
// Also tested (on gpt-image-1): passing n>1 with one shared prompt just
// returns near-identical samples, and the edit endpoint stays anchored to
// the input photo's camera angle, so a "three-quarter view" request does not
// actually rotate the product — only lighting/background/framing vary.
// Separate calls with their own tailored prompt (below) is what varies
// anything; callers/UI should not promise genuinely different angles.
const FIDELITY_RULES =
  "You are an expert AI commercial product photographer specializing in high-end e-commerce product photography. " +
  "The uploaded product image is the PRIMARY SOURCE OF TRUTH. Carefully analyze it and preserve: exact product shape, proportions, dimensions, geometry, colors, materials, surface texture, packaging, logos, brand identity, labels, printed text, buttons/handles/caps/components. " +
  "Do not redesign, improve, simplify, modernize, or reinterpret the product. Do not invent missing features, change its color or packaging, replace its logos, or add accessories not present in the reference. The generated product must clearly be the SAME physical product shown in the uploaded image. " +
  "If the uploaded photo has ANY existing background or surroundings — a table, shelf, countertop, floor, wall, tablecloth, scenery, other objects, hands, shadows cast on other things, text or watermarks — remove all of it completely and keep ONLY the product itself, cleanly cut out and placed on the studio backdrop described below. Nothing from the old background may remain. " +
  "Likewise remove every piece of text or graphic that was ADDED on top of the photo — title banners, captions, price tags, stickers, logos of the photographer or website, watermarks (for example a name written across a green strip over the picture). Keep ONLY text that is physically printed on the product's own label or packaging. If the product itself has no label or packaging (fresh produce, loose goods), the result must contain no text at all. " +
  "Never generate a cartoon, illustration, 3D render, CGI look, deformed product, incorrect proportions, extra or missing components, fake logos/text/labels, people, hands, props, watermarks, or promotional text — the result must be photorealistic.";

// Every prompt ends with the shared, config-driven style mandate
// (AI_IMAGE_STYLE_BLOCK): light-grey studio backdrop + studio lighting +
// soft contact shadow + photoreal. Edit those clauses in ai-config.ts.
function coverPrompt(title: string) {
  return `${FIDELITY_RULES}

EDIT this photo into the PRIMARY, standard e-commerce cover image: keep the product exactly as it is — same shape, size, angle and position, centered and completely inside the frame with generous empty margin on every side (never cropped or enlarged). Replace only the plain background (the grey gradient sweep behind the product is already provided — keep and refine it) and add the studio lighting, contact shadow and soft floor reflection described below.
Camera: straightforward, product-focused angle, natural perspective, sharp details, minimal distortion, high-end studio camera look.

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

function secondaryPrompt(title: string) {
  return `${FIDELITY_RULES}

Create a SECOND professional photograph of this SAME product for a secondary product-detail view — re-photograph it from a clearly DIFFERENT camera angle than the input — a three-quarter view turned about 30–40° to the side, showing the product's side/depth — keeping the whole product inside the frame with generous empty margin (never cropped), while the product itself stays completely identical (shape, color, materials, packaging, logo, text, components, proportions).

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

function marketingPrompt(title: string) {
  return `${FIDELITY_RULES}

Create a THIRD, premium commercial photograph of this SAME product from yet another viewpoint (a slightly elevated view looking down at about 30° so the top and front are both visible). Decide from the product itself:
- If this product is normally sold in packaging (for example fresh produce or loose goods sold in a bag, tray, net, box, tub, jar or bottle), show the real product together with that kind of packaging side by side: the product in front, and beside it a plain, generic, UNBRANDED package of the usual kind. The invented package must carry NO text, NO logo and NO artwork at all — leave it blank and plain. Never copy any text from the photo onto it.
- If the uploaded photo already shows a finished, branded, packaged product, show that exact package from this new viewpoint instead, with its real label unchanged.
Keep everything inside the frame with generous margin, never cropped; the product itself stays completely identical (shape, color, materials, packaging, logo, text, components, proportions). No lifestyle scene, no people, hands, other props, or watermarks.

${AI_IMAGE_STYLE_BLOCK}

Product title: ${title}`;
}

const SQUARE_PRODUCT_SIZE = 760;

const SHOT_PROMPTS = [coverPrompt, secondaryPrompt, marketingPrompt];

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
  if (!AI_IMAGE_GENERATION_ENABLED) return [];

  // The edit endpoint outputs a 1024x1024 square. Feeding it a non-square
  // photo (e.g. a wide 3:2 shot) makes the model re-crop/outpaint and redraw the
  // product, so the result comes out cropped and no longer matches. Instead,
  // place the product on a square of the target studio grey with a generous
  // margin: the model then only has to add light + shadow, in-frame, and is
  // anchored to the grey instead of echoing a white backdrop.
  const product = await sharp(input.bytes)
    .rotate()
    .resize(SQUARE_PRODUCT_SIZE, SQUARE_PRODUCT_SIZE, { fit: "inside", withoutEnlargement: false })
    .toBuffer();
  // The sweep is the target look itself: vertical grey gradient, darker at the
  // top and fading to a lighter grey at the bottom.
  // Built from raw pixels (no SVG): the SVG renderer is missing in the Next.js sharp build.
  const SIZE = 1024;
  const sweep = Buffer.alloc(SIZE * SIZE * 3);
  for (let y = 0; y < SIZE; y += 1) {
    const level = Math.round(189 + ((228 - 189) * y) / (SIZE - 1));
    sweep.fill(level, y * SIZE * 3, (y + 1) * SIZE * 3);
  }
  const png = await sharp(sweep, { raw: { width: SIZE, height: SIZE, channels: 3 } })
    .composite([{ input: product, gravity: "center" }])
    .png()
    .toBuffer();

  const title = input.title.trim() || "grocery product";
  const count = Math.max(1, Math.min(input.count ?? 1, SHOT_PROMPTS.length));
  const prompts = SHOT_PROMPTS.slice(0, count).map((build) => build(title));

  // The first shot becomes the catalog cover, so it must exist: retry it a
  // couple of times (transient network / API errors are common). The other
  // shots are best-effort and run in parallel.
  const generate = async (prompt: string, attempts: number) => {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
      try {
        const out = await editProductImage(png, prompt);
        if (out) return out;
      } catch (err) {
        console.error(`[cover-shot] attempt ${attempt} failed:`, err instanceof Error ? err.message : err);
      }
    }
    return null;
  };
  const results = await Promise.all(prompts.map((prompt, i) => generate(prompt, i === 0 ? 3 : 1)));

  const finished: Buffer[] = [];
  for (const shot of results) {
    if (!shot) continue;
    try {
      finished.push(await normalizeStudioBackdrop(shot));
    } catch (err) {
      // Never throw away a paid result: keep the raw AI shot if the clean-up fails.
      console.error("[cover-shot] backdrop clean-up failed, keeping raw shot:", err instanceof Error ? err.message : err);
      finished.push(shot);
    }
  }
  return finished;
}
