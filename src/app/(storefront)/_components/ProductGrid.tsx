"use client";

import { useMemo } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductCard } from "@/app/(storefront)/_components/ProductCard";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";

export function ProductGrid() {
  const { data, isPending, error } = useProducts();
  const { t, locale } = useTranslations();
  const isSkeleton = isPending;

  const items = useMemo(
    () => (isSkeleton ? mockProducts(locale) : (data ?? [])),
    [data, isSkeleton, locale],
  );

  if (error && !isSkeleton) {
    return (
      <p className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
        {error.message}
      </p>
    );
  }

  if (!isSkeleton && !data?.length) {
    return <p className="text-sm text-muted">{t("home.noProducts")}</p>;
  }

  return (
    <section>
      <h2 className="mb-3 font-bold">{t("home.allProducts")}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} isSkeleton={isSkeleton} />
        ))}
      </div>
    </section>
  );
}
