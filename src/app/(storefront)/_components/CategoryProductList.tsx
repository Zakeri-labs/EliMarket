"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction, getProductsAction } from "@/app/_actions/product-actions";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { categoryAndDescendantSlugs } from "@/lib/categories/tree";
import { productCompareAtPrice } from "@/lib/products/pricing";

const MOCK_LIST_COUNT = 6;

export type CategorySortKey = "newest" | "price-asc" | "price-desc";

export type CategoryListFilters = {
  minPrice: string;
  maxPrice: string;
  onSale: boolean;
  sort: CategorySortKey;
};

type Props = {
  slug?: string;
  filters?: CategoryListFilters;
};

export function CategoryProductList({ slug, filters }: Props) {
  const { locale } = useTranslations();
  const { data: products, isPending } = useQuery({
    queryKey: ["products", slug ?? "all"],
    queryFn: async () => {
      const [productsResult, categoriesResult] = await Promise.all([
        getProductsAction(),
        getCategoriesAction(),
      ]);
      if (!productsResult.success) throw new Error(productsResult.error);
      const all = productsResult.data;
      if (!slug) return all;
      const categories = categoriesResult.success ? categoriesResult.data : [];
      const slugs = categoryAndDescendantSlugs(categories, slug);
      return all.filter((p) => p.category && slugs.includes(p.category.slug));
    },
  });

  const isSkeleton = isPending;
  const { minPrice, maxPrice, onSale, sort } = filters ?? {};
  const items = useMemo(() => {
    if (isSkeleton) return mockProducts(locale).slice(0, MOCK_LIST_COUNT);
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const list = (products ?? []).filter((p) => {
      if (min != null && !Number.isNaN(min) && Number(p.price) < min) return false;
      if (max != null && !Number.isNaN(max) && Number(p.price) > max) return false;
      if (onSale) {
        const compareAt = productCompareAtPrice(p);
        if (compareAt == null || compareAt <= Number(p.price)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      return b.created_at.localeCompare(a.created_at);
    });
  }, [isSkeleton, locale, products, minPrice, maxPrice, onSale, sort]);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((product, index) => (
        <ProductDealCard
          key={product.id}
          product={product}
          isSkeleton={isSkeleton}
          layout="grid"
          priority={index < 4}
        />
      ))}
    </div>
  );
}
