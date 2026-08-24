"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export default function FavouritesPage() {
  const { t, dir } = useTranslations();
  const { data: products, isPending } = useProducts();
  const items = useWishlistStore((s) => s.items);

  const favourites = useMemo(() => {
    const ids = new Set(items.map((item) => item.productId));
    return (products ?? []).filter((product) => ids.has(product.id));
  }, [products, items]);

  return (
    <main className="py-4 md:py-6" dir={dir}>
      <Link href="/account" className="mb-4 inline-flex items-center gap-1 text-sm text-accent">
        <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
        {t("account.title")}
      </Link>
      <h1 className="mb-4 text-xl font-bold">{t("account.favouritesTitle")}</h1>

      {isPending ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : !items.length ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">{t("account.noFavouritesYet")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
    </main>
  );
}
