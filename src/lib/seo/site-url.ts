import { publicEnv } from "@/config/env";

export function getSiteUrl(): string {
  return publicEnv.appUrl.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${getSiteUrl()}${normalized}`;
}

/** Cookie-based i18n: same URL serves all locales; hreflang tags reflect that. */
export function languageAlternates(path = "/"): Record<string, string> {
  const url = absoluteUrl(path);
  return {
    fa: url,
    ar: url,
    en: url,
    "x-default": url,
  };
}

export function trimDescription(text: string | null | undefined, max = 160): string {
  if (!text?.trim()) return "";
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}
