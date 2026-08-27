import type { HeroBanner } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

export type HeroBannerTextField = "badge" | "title" | "subtitle" | "cta_label";

/**
 * Pick a hero banner text field for the active locale, falling back to the
 * other languages and finally to the legacy single-value column.
 */
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

  return (
    byLocale[locale]?.trim() ||
    byLocale.fa?.trim() ||
    byLocale.ar?.trim() ||
    byLocale.en?.trim() ||
    banner[field]?.trim() ||
    ""
  );
}
