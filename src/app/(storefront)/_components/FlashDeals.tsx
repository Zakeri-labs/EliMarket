"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Clock, Plus } from "lucide-react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export function FlashDeals() {
  const { data: products, isPending } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const { t, locale } = useTranslations();
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();
  const isSkeleton = isPending;

  const deals = useMemo(
    () => (isSkeleton ? mockFlashDeals(locale) : (products?.slice(0, 6) ?? [])),
    [isSkeleton, locale, products],
  );

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-bold">{t("home.flashDeals")}</h2>
          <p className="flex items-center gap-1 text-[10px] text-accent">
            <AppIcon icon={Clock} size="xs" />
            {t("home.flashEnds")}
          </p>
        </div>
        <Link href="/categories" className="shrink-0 text-xs font-medium text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {deals.map((product, i) => {
          const discount = i % 2 === 0 ? 25 : 15;
          const original = Number(product.price) * (1 + discount / 100);
          return (
            <article
              key={product.id}
              className={cn(
                "w-36 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface sm:w-40",
                isSkeleton && "skeleton",
              )}
              aria-busy={isSkeleton}
            >
              <Link
                href={isSkeleton ? "#" : `/products/${product.slug}`}
                className="relative block"
                onClick={(e) => {
                  if (isSkeleton) e.preventDefault();
                }}
              >
                {!isSkeleton && (
                  <span className="absolute end-2 top-2 z-10 rounded-lg bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                    −{discount}٪
                  </span>
                )}
                <div className="target relative aspect-square bg-surface-elevated">
                  {product.image_url ? (
                    <StorefrontImage
                      src={product.image_url}
                      blurHash={product.blur_hash}
                      alt={product.name}
                      fill
                      priority={i < 2}
                      sizes="144px"
                      withBlur={!isSkeleton}
                      className="object-cover"
                    />
                  ) : (
                    <ProductPlaceholder size="lg" />
                  )}
                </div>
              </Link>
              <div className="p-2.5">
                <p className="truncate text-xs font-medium">{product.name}</p>
                {showPrices && (
                  <>
                    <p className="text-[10px] text-muted line-through">
                      {formatPrice(Math.round(original))}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-xs font-bold text-accent">
                        {formatPrice(Number(product.price))}
                      </span>
                      {product.stock > 0 && (
                        <button
                          type="button"
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-black"
                          disabled={isSkeleton}
                          onClick={() => {
                            if (isSkeleton) return;
                            addItem({
                              productId: product.id,
                              name: product.name,
                              slug: product.slug,
                              price: Number(product.price),
                              currency: product.currency,
                              imageUrl: product.image_url,
                              blurHash: product.blur_hash,
                            });
                          }}
                        >
                          <AppIcon icon={Plus} size="xs" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
