"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction, getProductsAction } from "@/app/_actions/product-actions";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { categoryAndDescendantSlugs } from "@/lib/categories/tree";

const MOCK_LIST_COUNT = 6;

type Props = {
  slug?: string;
};

export function CategoryProductList({ slug }: Props) {
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
  const items = useMemo(
    () =>
      isSkeleton
        ? mockProducts(locale).slice(0, MOCK_LIST_COUNT)
        : (products ?? []),
    [isSkeleton, locale, products],
  );

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
