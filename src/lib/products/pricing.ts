import type { Product } from "@/app/_types/database.types";

export function productCompareAtPrice(product: Product): number | null {
  const compareAt = product.compare_at_price;
  if (compareAt == null || compareAt <= Number(product.price)) return null;
  return Number(compareAt);
}

export function productDiscountPercent(product: Product): number | null {
  const compareAt = productCompareAtPrice(product);
  if (compareAt == null) return null;
  const price = Number(product.price);
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function isFlashDealProduct(product: Product): boolean {
  return productDiscountPercent(product) != null;
}

export function sortFlashDealProducts(products: Product[]): Product[] {
  return [...products]
    .filter(isFlashDealProduct)
    .sort((a, b) => (productDiscountPercent(b) ?? 0) - (productDiscountPercent(a) ?? 0));
}
