import type { Category } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

/** Pick storefront category label for the active locale with sensible fallbacks. */
export function resolveCategoryName(category: Category, locale: Locale): string {
  const localized = {
    fa: category.name_fa,
    ar: category.name_ar,
    en: category.name_en,
  }[locale];

  return (
    localized?.trim() ||
    category.name_fa?.trim() ||
    category.name_ar?.trim() ||
    category.name_en?.trim() ||
    category.name
  );
}
