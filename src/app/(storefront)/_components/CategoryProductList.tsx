"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/app/_actions/product-actions";
import { ProductCard } from "@/app/(storefront)/_components/ProductCard";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";

const MOCK_LIST_COUNT = 6;

type Props = {
  slug?: string;
};

export function CategoryProductList({ slug }: Props) {
  const { locale } = useTranslations();
  const { data: products, isPending } = useQuery({
    queryKey: ["products", slug ?? "all"],
    queryFn: async () => {
      const r = await getProductsAction();
      if (!r.success) throw new Error(r.error);
      const all = r.data;
      if (!slug) return all;
      return all.filter((p) => p.category?.slug === slug);
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
    <div className="space-y-2">
      {items.map((product) => (
        <ProductCard key={product.id} product={product} compact isSkeleton={isSkeleton} />
      ))}
    </div>
  );
}
