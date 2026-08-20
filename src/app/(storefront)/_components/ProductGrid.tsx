"use client";

import { useMemo } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";

export function ProductGrid() {
  const { data, isPending, error } = useProducts();
  const { t, locale, dir } = useTranslations();
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
    <section dir={dir}>
      <h2 className="mb-4 text-start text-base font-bold sm:text-lg">{t("home.allProducts")}</h2>
      <div className="-mx-4 flex flex-wrap justify-start gap-3 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {items.map((product, index) => (
          <ProductDealCard
            key={product.id}
            product={product}
            isSkeleton={isSkeleton}
            priority={index < 4}
          />
        ))}
      </div>
    </section>
  );
}
