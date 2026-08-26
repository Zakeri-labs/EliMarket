import type { Product } from "@/app/_types/database.types";

export function productCompareAtPrice(product: Product): number | null {
  const compareAt = product.compare_at_price;
  if (compareAt == null || compareAt <= Number(product.price)) return null;
  return Number(compareAt);
}

export function productDiscountPercent(product: Product): number | null {
  if (product.campaign?.type === "percent") {
    const value = Math.round(Number(product.campaign.discount_value));
    return Number.isFinite(value) && value > 0 ? value : null;
  }
  const compareAt = productCompareAtPrice(product);
  if (compareAt == null) return null;
  const price = Number(product.price);
  const percent = Math.round(((compareAt - price) / compareAt) * 100);
  return percent > 0 ? percent : null;
}

export function productDiscountBadge(
  product: Product,
  formatPrice: (value: number, currency?: string) => string,
): string | null {
  const campaign = product.campaign;
  if (campaign?.type === "percent") {
    const percent = productDiscountPercent(product);
    return percent != null ? `${percent}%` : null;
  }
  if (campaign) {
    const value = Number(campaign.discount_value);
    if (!Number.isFinite(value) || value <= 0) return null;
    return formatPrice(value, product.currency);
  }
  const percent = productDiscountPercent(product);
  return percent != null ? `${percent}%` : null;
}

export function isFlashDealProduct(product: Product): boolean {
  return productDiscountPercent(product) != null;
}

export function sortFlashDealProducts(products: Product[]): Product[] {
  return [...products]
    .filter(isFlashDealProduct)
    .sort((a, b) => (productDiscountPercent(b) ?? 0) - (productDiscountPercent(a) ?? 0));
}
