/**
 * Shape + defaults of the admin-managed AI settings. Safe to import from
 * client components (no server-only imports). Secrets (API keys) are NOT
 * part of this — they stay in the server environment.
 *
 * The defaults are the cheap options on purpose: image generation and web
 * image search are OFF, models are the mini tiers, quality is "low".
 */

export type AiImageProvider = "gemini" | "openai";
export type AiImageQuality = "low" | "medium" | "high" | "auto";

export type AiStyle = {
  background: string;
  lighting: string;
  shadow: string;
  realism: string;
  labels: string;
};

export type AiSettings = {
  imageGenerationEnabled: boolean;
  imageProvider: AiImageProvider;
  /** Empty = follow the provider's default model. */
  imageModel: string;
  imageQuality: AiImageQuality;
  maxStudioShots: number;
  maxContextShots: number;
  webImageSearchEnabled: boolean;
  textModel: string;
  visionModel: string;
  webSearchModel: string;
  style: AiStyle;
};

export const DEFAULT_AI_STYLE: AiStyle = {
  background:
    "Background: a seamless studio paper sweep filling the ENTIRE frame edge to edge, in neutral grey with a smooth vertical gradient — a MID-DARK grey at the TOP (about #707070) that opens up gradually and invisibly through mid grey (about #969696 around the middle) into a LIGHT soft grey (about #DCDCDC) in the lower third and at the bottom, where the product sits. No visible horizon line, seam, band or border; no patterns, props, text or vignette rings. Pure neutral grey, never white, never tinted warm or cool.",
  lighting:
    "Lighting: high-end commercial STUDIO LIGHTING — ONE large soft box high and to the RIGHT of the product as the single key light (always from the same side, upper right, about 30 degrees from vertical) with only a very gentle fill from the left, producing smooth natural highlights, a soft specular edge/rim highlight and rounded volume on the product, and a faint bright glow on the floor around its base. Realistic highlights/reflections true to the product's material. Never flat or evenly lit.",
  shadow:
    "Shadow: a soft, diffused, realistic CONTACT SHADOW that is ALWAYS cast toward the LEFT side of the image (the product's left, viewer's left) at a fixed angle of about 30 degrees, identical for every product — the shadow must NEVER fall to the right (the exact opposite side of the upper-right key light) — the same direction and angle in every image, never to the right, never straight behind or in front — starting directly beneath the product, darkest right at the contact point and fading smoothly into the light grey floor, plus a very subtle soft reflection on the surface — never a hard, detached or cut-out drop shadow.",
  realism:
    "Realism: the image must look like a real DSLR studio PHOTOGRAPH — natural surface texture, micro-imperfections and true material response. Absolutely NO cartoon, illustration, 3D render, CGI, or plasticky / waxy / over-smoothed look.",
  labels:
    "Label fidelity (applies ONLY to the product's own physical packaging/label — NEVER to anything overlaid on the photo): the product's packaging, brand mark, and EVERY piece of text printed on it must be reproduced EXACTLY as in the source image — same wording, same script, same spelling, same layout, same fonts, same colours, character for character (including Persian/Arabic text and small print). Do NOT translate, restyle, re-typeset, paraphrase, blur, or invent any text or logo. If a detail is unreadable in the source, leave that area as a plain unlabelled surface rather than guessing. NO INVENTED LABELS: if the product in the source photo has no label, brand, logo or printed text (fresh produce, eggs in a plain tray, meat, bread, loose goods), the result must have NONE either — never add a label, sticker, brand name, logo, product name, weight, barcode or any text of your own to the product, its tray, bag or packaging.",
};

export const DEFAULT_AI_SETTINGS: AiSettings = {
  imageGenerationEnabled: false,
  imageProvider: "gemini",
  imageModel: "",
  imageQuality: "low",
  maxStudioShots: 3,
  maxContextShots: 0,
  webImageSearchEnabled: false,
  textModel: "gpt-4o-mini",
  visionModel: "gpt-4o-mini",
  webSearchModel: "gpt-4o-mini",
  style: DEFAULT_AI_STYLE,
};

/** The image model actually used: the explicit one, or the provider default. */
export function resolveImageModel(settings: AiSettings): string {
  if (settings.imageModel.trim()) return settings.imageModel.trim();
  return settings.imageProvider === "openai" ? "gpt-image-1-mini" : "gemini-2.5-flash-image";
}

/** The style clauses as one block, ready to drop into any image prompt. */
export function buildStyleBlock(style: AiStyle): string {
  return [style.background, style.lighting, style.shadow, style.realism, style.labels].join("\n");
}

function clampInt(value: unknown, fallback: number, max: number): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), max) : fallback;
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

/** Merge an untrusted/partial stored value over the defaults. */
export function normalizeAiSettings(raw: unknown): AiSettings {
  const d = DEFAULT_AI_SETTINGS;
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const s = (r.style && typeof r.style === "object" ? r.style : {}) as Record<string, unknown>;
  const provider: AiImageProvider = r.imageProvider === "openai" ? "openai" : "gemini";
  const quality = ["low", "medium", "high", "auto"].includes(r.imageQuality as string)
    ? (r.imageQuality as AiImageQuality)
    : d.imageQuality;
  return {
    imageGenerationEnabled: r.imageGenerationEnabled === true,
    imageProvider: provider,
    imageModel: typeof r.imageModel === "string" ? r.imageModel.trim() : d.imageModel,
    imageQuality: quality,
    maxStudioShots: clampInt(r.maxStudioShots, d.maxStudioShots, 3),
    maxContextShots: clampInt(r.maxContextShots, d.maxContextShots, 2),
    webImageSearchEnabled: r.webImageSearchEnabled === true,
    textModel: text(r.textModel, d.textModel),
    visionModel: text(r.visionModel, d.visionModel),
    webSearchModel: text(r.webSearchModel, d.webSearchModel),
    style: {
      background: text(s.background, d.style.background),
      lighting: text(s.lighting, d.style.lighting),
      shadow: text(s.shadow, d.style.shadow),
      realism: text(s.realism, d.style.realism),
      labels: text(s.labels, d.style.labels),
    },
  };
}
