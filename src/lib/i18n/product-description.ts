import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

/** Pick storefront description for the active locale with sensible fallbacks. */
export function resolveProductDescription(
  product: Product,
  locale: Locale,
): string | null {
  const localized = {
    fa: product.description_fa,
    ar: product.description_ar,
    en: product.description_en,
  }[locale];

  return (
    localized?.trim() ||
    product.description_fa?.trim() ||
    product.description_ar?.trim() ||
    product.description_en?.trim() ||
    product.description?.trim() ||
    null
  );
}

/** Short storefront blurb for product cards. */
export function resolveProductCardExcerpt(
  product: Product,
  locale: Locale,
  maxLength = 72,
): string | null {
  const description = resolveProductDescription(product, locale);
  if (!description) return null;
  if (description.length <= maxLength) return description;
  return `${description.slice(0, maxLength).trim()}…`;
}

/** All description fields for search indexing. */
export function productDescriptionSearchText(product: Product): string {
  return [
    product.description_fa,
    product.description_ar,
    product.description_en,
    product.description,
  ]
    .filter(Boolean)
    .join(" ");
}
