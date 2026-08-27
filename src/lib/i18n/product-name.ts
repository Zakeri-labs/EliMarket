import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

/** Pick storefront product name for the active locale with sensible fallbacks. */
export function resolveProductName(product: Product, locale: Locale): string {
  const localized = {
    fa: product.name_fa,
    ar: product.name_ar,
    en: product.name_en,
  }[locale];

  return (
    localized?.trim() ||
    product.name_fa?.trim() ||
    product.name_ar?.trim() ||
    product.name_en?.trim() ||
    product.name
  );
}
