"use client";

import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

type Props = { product: Product; compact?: boolean };

export function ProductCard({ product, compact }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();
  const { t } = useTranslations();

  if (compact) {
    return (
      <Link
        href={`/products/${product.slug}`}
        className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
      >
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-elevated">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ProductPlaceholder size="md" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{product.name}</p>
          {showPrices && (
            <p className="text-xs text-accent">{formatPrice(Number(product.price))}</p>
          )}
        </div>
        <AppIcon icon={ChevronLeft} size="sm" className="text-muted rtl:rotate-180" />
      </Link>
    );
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-surface">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square bg-surface-elevated">
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <ProductPlaceholder size="xl" />
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/products/${product.slug}`}>
          <h3 className="truncate text-sm font-semibold">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center justify-between">
          {showPrices ? (
            <span className="text-sm font-bold text-accent">
              {formatPrice(Number(product.price), product.currency)}
            </span>
          ) : (
            <span className="text-xs text-muted">{t("store.pricesHidden")}</span>
          )}
          {showPrices && product.stock > 0 && (
            <button
              type="button"
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-black"
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
              <AppIcon icon={Plus} size="sm" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
