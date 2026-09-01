/**
 * Central cost controls for every PAID OpenAI call in the app.
 *
 * All values are environment-overridable so spend can be dialled up or down
 * without a code change. The defaults are the cheap options on purpose —
 * pre-launch, the priority is a near-zero AI bill:
 *
 *  - AI image generation (gpt-image-1) is OFF. Product photos still get the
 *    grey studio background + soft shadow, produced by the free, local,
 *    deterministic sharp pipeline (src/lib/images/enhance-product-photo.ts).
 *  - When image generation is turned on, it uses gpt-image-1-mini at "low"
 *    quality, which is roughly 20-30x cheaper per image than gpt-image-1 at
 *    "high".
 *  - Web image search (billed web_search tool + a vision model) is OFF.
 *  - Text/vision drafting stays on but on the mini models (cents per product).
 *
 * To restore the premium behaviour, set in the environment:
 *   AI_IMAGE_GENERATION_ENABLED=true
 *   OPENAI_IMAGE_MODEL=gpt-image-1
 *   OPENAI_IMAGE_QUALITY=high
 *   AI_WEB_IMAGE_SEARCH_ENABLED=true
 */

function flag(name: string, fallback: boolean): boolean {
  const raw = process.env[name]?.trim().toLowerCase();
  if (!raw) return fallback;
  return raw === "1" || raw === "true" || raw === "yes" || raw === "on";
}

function str(name: string, fallback: string): string {
  return process.env[name]?.trim() || fallback;
}

function int(name: string, fallback: number): number {
  const n = Number(process.env[name]?.trim());
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : fallback;
}

/** Master switch for gpt-image-1 studio cover + context shots. */
export const AI_IMAGE_GENERATION_ENABLED = flag("AI_IMAGE_GENERATION_ENABLED", false);

/** Image model + quality used only when generation is enabled. */
export const AI_IMAGE_MODEL = str("OPENAI_IMAGE_MODEL", "gpt-image-1-mini");
/** "low" | "medium" | "high" | "auto" */
export const AI_IMAGE_QUALITY = str("OPENAI_IMAGE_QUALITY", "low");

/** How many AI shots to attempt per source photo (the free deterministic
 *  framer fills any remaining gallery slots). */
export const AI_MAX_STUDIO_SHOTS = int("AI_MAX_STUDIO_SHOTS", 1);
export const AI_MAX_CONTEXT_SHOTS = int("AI_MAX_CONTEXT_SHOTS", 0);

/** Master switch for OpenAI web image search (billed web_search tool). */
export const AI_WEB_IMAGE_SEARCH_ENABLED = flag("AI_WEB_IMAGE_SEARCH_ENABLED", false);

/** Text + vision models. Minis are already ~cents; kept overridable anyway. */
export const AI_TEXT_MODEL = str("OPENAI_TEXT_MODEL", "gpt-4o-mini");
export const AI_VISION_MODEL = str("OPENAI_VISION_MODEL", "gpt-4o-mini");
export const AI_WEB_SEARCH_MODEL = str("OPENAI_WEB_SEARCH_MODEL", "gpt-4o-mini");

/**
 * The mandatory look for EVERY AI-generated product image. Each clause is
 * injected verbatim into every image prompt (cover shots + context shots), so
 * a generated image is always: light-grey studio backdrop + studio lighting +
 * soft contact shadow + photoreal (never CGI). Edit here — or override a
 * single line via its env var — to change the art direction in one place.
 */
export const AI_IMAGE_STYLE = {
  background: str(
    "AI_IMAGE_STYLE_BACKGROUND",
    "Background: a clean, seamless studio backdrop in a soft, even LIGHT GREY — clearly grey, never pure white; no patterns, no props, no visible seams or banding; the product is cleanly separated from it.",
  ),
  lighting: str(
    "AI_IMAGE_STYLE_LIGHTING",
    "Lighting: professional STUDIO LIGHTING — a soft, directional key light with gentle fill, a subtle brighter pool behind the product falling off gradually toward the corners, and realistic highlights/reflections true to the product's material. Never flat or evenly lit.",
  ),
  shadow: str(
    "AI_IMAGE_STYLE_SHADOW",
    "Shadow: a soft, diffused, realistic CONTACT SHADOW directly beneath the product that anchors it to the surface — never a hard or detached drop shadow.",
  ),
  realism: str(
    "AI_IMAGE_STYLE_REALISM",
    "Realism: the image must look like a real DSLR studio PHOTOGRAPH — natural surface texture, micro-imperfections and true material response. Absolutely NO cartoon, illustration, 3D render, CGI, or plasticky / waxy / over-smoothed look.",
  ),
  labels: str(
    "AI_IMAGE_STYLE_LABELS",
    "Label fidelity: the packaging, brand mark, and EVERY piece of printed text must be reproduced EXACTLY as in the source image — same wording, same script, same spelling, same layout, same fonts, same colours, character for character (including Persian/Arabic text and small print). Do NOT translate, restyle, re-typeset, paraphrase, blur, or invent any text or logo. If a detail is unreadable in the source, leave that area as a plain unlabelled surface rather than guessing.",
  ),
};

/** The style clauses as one block, ready to drop into any image prompt. */
export const AI_IMAGE_STYLE_BLOCK = [
  AI_IMAGE_STYLE.background,
  AI_IMAGE_STYLE.lighting,
  AI_IMAGE_STYLE.shadow,
  AI_IMAGE_STYLE.realism,
  AI_IMAGE_STYLE.labels,
].join("\n");
