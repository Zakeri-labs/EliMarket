import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { englishFromSlug, firstFitting } from "@/lib/i18n/locale-text";

export type LocalizedNameSource = {
  name?: string | null;
  name_fa?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
  slug?: string | null;
};

/** Pick a name for the active locale — never mix in another language. */
export function resolveLocalizedName(source: LocalizedNameSource, locale: Locale): string {
  if (locale === "en") {
    return (
      firstFitting("en", source.name_en, source.name, source.name_fa) ||
      englishFromSlug(source.slug)
    );
  }

  if (locale === "ar") {
    return firstFitting("ar", source.name_ar) || englishFromSlug(source.slug);
  }

  return (
    firstFitting("fa", source.name_fa, source.name) ||
    source.name?.trim() ||
    englishFromSlug(source.slug)
  );
}

/** Pick storefront product name for the active locale — never mix in another language. */
export function resolveProductName(product: Product, locale: Locale): string {
  return resolveLocalizedName(product, locale);
}

export function productNameSnapshot(product: Product) {
  return {
    name_fa: resolveProductName(product, "fa"),
    name_ar: resolveProductName(product, "ar"),
    name_en: resolveProductName(product, "en"),
  };
}
