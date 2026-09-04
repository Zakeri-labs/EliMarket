import type { Category } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { englishFromSlug, firstFitting } from "@/lib/i18n/locale-text";

/** Pick storefront category label for the active locale — never mix in another language. */
export function resolveCategoryName(category: Category, locale: Locale): string {
  if (locale === "en") {
    return firstFitting("en", category.name_en, category.name) || englishFromSlug(category.slug);
  }
  if (locale === "ar") {
    return firstFitting("ar", category.name_ar) || englishFromSlug(category.slug);
  }
  return (
    firstFitting("fa", category.name_fa, category.name) ||
    category.name ||
    englishFromSlug(category.slug)
  );
}
