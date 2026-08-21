"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { FlashDealTimer } from "@/app/(storefront)/_components/FlashDealTimer";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { sortFlashDealProducts } from "@/lib/products/pricing";

export function FlashDeals() {
  const { data: products, isPending } = useProducts();
  const { t, dir, locale } = useTranslations();
  const isSkeleton = isPending;

  const deals = useMemo(() => {
    if (isSkeleton) return mockFlashDeals(locale);
    if (!products?.length) return [];
    return sortFlashDealProducts(products).slice(0, 6);
  }, [isSkeleton, locale, products]);

  if (!isSkeleton && deals.length === 0) return null;

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-start text-base font-bold sm:text-lg">{t("home.flashDeals")}</h2>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <FlashDealTimer />
          <Link href="/categories" className="text-sm font-medium text-accent">
            {t("home.viewAll")}
          </Link>
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex items-stretch justify-start gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {deals.map((product, index) => (
          <ProductDealCard
            key={product.id}
            product={product}
            isSkeleton={isSkeleton}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
