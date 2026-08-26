"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { useTranslations } from "@/i18n/use-translations";

export function AccountFavouritesPanel() {
  const { t } = useTranslations();
  const { data: products, isPending } = useProducts();
  const items = useWishlistStore((s) => s.items);

  const favourites = useMemo(() => {
    const ids = new Set(items.map((item) => item.productId));
    return (products ?? []).filter((product) => ids.has(product.id));
  }, [products, items]);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold md:text-xl">{t("account.favouritesTitle")}</h2>
      {isPending ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">{t("account.noFavouritesYet")}</p>
          <Link href="/" className="mt-3 inline-block text-sm text-accent">
            {t("orders.startShopping")}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
          {favourites.map((product, index) => (
            <ProductDealCard
              key={product.id}
              product={product}
              priority={index < 4}
              layout="grid"
            />
          ))}
        </div>
      )}
    </div>
  );
}
