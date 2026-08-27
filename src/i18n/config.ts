export const LOCALES = ["fa", "ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  fa: "فارسی",
  ar: "العربية",
  en: "English",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  fa: "FA",
  ar: "AR",
  en: "EN",
};

/** Persian & Arabic → RTL; English → LTR */
export function getDirection(locale: Locale): "rtl" | "ltr" {
  return locale === "en" ? "ltr" : "rtl";
}

export function getNumberLocale(locale: Locale): string {
  switch (locale) {
    case "en":
      return "en-US";
    case "ar":
      return "ar-SA";
    default:
      return "fa-IR";
  }
}
