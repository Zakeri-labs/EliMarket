import type { Product } from "@/app/_types/database.types";
import { productDescriptionSearchText } from "@/lib/i18n/product-description";

/** Matches a product against a free-text query across name, description, and category. */
export function matchesProductQuery(product: Product, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  return (
    product.name.includes(q) ||
    productDescriptionSearchText(product).includes(q) ||
    (product.category?.name.includes(q) ?? false)
  );
}
