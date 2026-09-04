import type { Locale } from "@/i18n/config";

function hasArabicScript(text: string): boolean {
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code == null) continue;
    if (code >= 0x0600 && code <= 0x06ff) return true;
    if (code >= 0x0750 && code <= 0x077f) return true;
    if (code >= 0x08a0 && code <= 0x08ff) return true;
    if (code >= 0xfb50 && code <= 0xfdff) return true;
    if (code >= 0xfe70 && code <= 0xfeff) return true;
  }
  return false;
}

/** Letters typical of Persian (not used in standard Arabic). */
const PERSIAN_LETTERS = /[پچژگکی]/;

export function textFitsLocale(text: string | null | undefined, locale: Locale): boolean {
  const value = text?.trim();
  if (!value) return false;
  if (locale === "en") return !hasArabicScript(value);
  if (locale === "ar") return !PERSIAN_LETTERS.test(value);
  return true;
}

/** Trimmed text only when it belongs to the active language; otherwise empty. */
export function onlyIfLocale(text: string | null | undefined, locale: Locale): string {
  const value = text?.trim() ?? "";
  return value && textFitsLocale(value, locale) ? value : "";
}

/** First non-empty candidate that belongs to the active language. */
export function firstFitting(
  locale: Locale,
  ...candidates: Array<string | null | undefined>
): string | null {
  for (const candidate of candidates) {
    const value = onlyIfLocale(candidate, locale);
    if (value) return value;
  }
  return null;
}

export function humanizeSlug(slug: string): string {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) =>
      /^[\d.]+[a-z]*$/i.test(part) ? part : part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ");
}

/** English label derived from a kebab-case slug; never returns Arabic script. */
export function englishFromSlug(slug: string | null | undefined): string {
  if (!slug?.trim()) return "Product";
  const pretty = humanizeSlug(slug);
  return textFitsLocale(pretty, "en") ? pretty : "Product";
}
