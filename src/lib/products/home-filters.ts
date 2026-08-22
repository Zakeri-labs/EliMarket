import type { Product } from "@/app/_types/database.types";

export function isOrganicProduct(product: Product) {
  const blob = [
    product.name,
    product.description,
    product.description_en,
    product.description_fa,
    product.description_ar,
    ...(product.features ?? []).flatMap((f) => [f.label, f.value]),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /organic|ارگانیک|عضوي/.test(blob);
}

export type HomePill =
  | "campaigns"
  | "newest"
  | "bestsellers"
  | "discounted"
  | "under1"
  | "local";

export function applyHomeFilters(
  products: Product[],
  options: {
    inStock?: boolean;
    onCampaign?: boolean;
    organic?: boolean;
    minPrice?: number;
    maxPrice?: number;
    categoryIds?: string[] | null;
    /** Also match product.category.slug (mock IDs often diverge from category list IDs). */
    categorySlugs?: string[] | null;
    pill?: HomePill | null;
  },
) {
  return products.filter((product) => {
    const ids = options.categoryIds;
    const slugs = options.categorySlugs;
    if (ids?.length || slugs?.length) {
      const id = product.category_id ?? product.category?.id ?? null;
      const slug = product.category?.slug ?? null;
      const idMatch = Boolean(id && ids?.includes(id));
      const slugMatch = Boolean(slug && slugs?.includes(slug));
      if (!idMatch && !slugMatch) return false;
    }
    if (options.inStock && product.stock <= 0) return false;
    if (options.onCampaign && !product.campaign) return false;
    if (options.organic && !isOrganicProduct(product)) return false;
    if (options.minPrice != null && Number(product.price) < options.minPrice) return false;
    if (options.maxPrice != null && Number(product.price) > options.maxPrice) return false;
    if (options.pill === "campaigns" && !product.campaign) return false;
    if (options.pill === "discounted") {
      const compare = product.compare_at_price;
      if (!product.campaign && (compare == null || compare <= Number(product.price))) {
        return false;
      }
    }
    if (options.pill === "under1" && Number(product.price) >= 1) return false;
    if (options.pill === "local") {
      const slug = product.category?.slug ?? "";
      if (!slug.includes("produce") && !/local|محلی|محلي/.test(product.name.toLowerCase())) {
        return false;
      }
    }
    return true;
  });
}
