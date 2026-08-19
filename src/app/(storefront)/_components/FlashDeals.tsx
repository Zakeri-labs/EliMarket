"use client";

import Link from "next/link";
import { Clock, Plus } from "lucide-react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export function FlashDeals() {
  const { data: products, isLoading } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();

  const deals = products?.slice(0, 6) ?? [];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="font-bold">{t("home.flashDeals")}</h2>
          <p className="flex items-center gap-1 text-[10px] text-accent">
            <AppIcon icon={Clock} size="xs" />
            {t("home.flashEnds")}
          </p>
        </div>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : (
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-3 md:gap-4 md:overflow-visible md:px-0 lg:grid-cols-4">
          {deals.map((product, i) => {
            const discount = i % 2 === 0 ? 25 : 15;
            const original = Number(product.price) * (1 + discount / 100);
            return (
              <article
                key={product.id}
                className="w-36 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface md:w-auto"
              >
                <Link href={`/products/${product.slug}`} className="relative block">
                  <span className="absolute end-2 top-2 z-10 rounded-lg bg-danger px-1.5 py-0.5 text-[10px] font-bold text-white">
                    −{discount}٪
                  </span>
                  <div className="aspect-square bg-surface-elevated">
                    {product.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={product.image_url} alt="" className="h-full w-full object-cover" />
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
                            onClick={() =>
                              addItem({
                                productId: product.id,
                                name: product.name,
                                slug: product.slug,
                                price: Number(product.price),
                                currency: product.currency,
                                imageUrl: product.image_url,
                              })
                            }
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
      )}
    </section>
  );
}
