import type { HeroBanner } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { firstFitting } from "@/lib/i18n/locale-text";

export type HeroBannerTextField = "badge" | "title" | "subtitle" | "cta_label";

/** Pick a hero banner text field for the active locale — no cross-language fallback. */
export function resolveHeroBannerText(
  banner: HeroBanner,
  field: HeroBannerTextField,
  locale: Locale,
): string {
  const byLocale: Record<Locale, string | null> = {
    fa: banner[`${field}_fa`],
    ar: banner[`${field}_ar`],
    en: banner[`${field}_en`],
  };

  return firstFitting(locale, byLocale[locale], banner[field]) ?? "";
}
