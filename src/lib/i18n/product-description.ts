import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { firstFitting } from "@/lib/i18n/locale-text";

/** Pick storefront description for the active locale — no cross-language fallback. */
export function resolveProductDescription(
  product: Product,
  locale: Locale,
): string | null {
  if (locale === "en") {
    return firstFitting("en", product.description_en);
  }
  if (locale === "ar") {
    return firstFitting("ar", product.description_ar);
  }
  return firstFitting("fa", product.description_fa, product.description);
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
