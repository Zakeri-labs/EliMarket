"use client";

import Link from "next/link";
import { ChevronLeft, Plus } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

type Props = { product: Product; compact?: boolean; isSkeleton?: boolean };

export function ProductCard({ product, compact, isSkeleton = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();
  const { t } = useTranslations();

  if (compact) {
    return (
      <Link
        href={isSkeleton ? "#" : `/products/${product.slug}`}
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
          isSkeleton && "skeleton pointer-events-none",
        )}
        onClick={(e) => {
          if (isSkeleton) e.preventDefault();
        }}
        aria-busy={isSkeleton}
      >
        <div className="target relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-surface-elevated">
          {product.image_url ? (
            <StorefrontImage
              src={product.image_url}
              blurHash={product.blur_hash}
              alt=""
              fill
              sizes="56px"
              withBlur={!isSkeleton}
              className="object-cover"
            />
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
    <article
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-surface",
        isSkeleton && "skeleton",
      )}
      aria-busy={isSkeleton}
    >
      <Link
        href={isSkeleton ? "#" : `/products/${product.slug}`}
        className="block"
        onClick={(e) => {
          if (isSkeleton) e.preventDefault();
        }}
      >
        <div className="target relative aspect-square bg-surface-elevated">
          {product.image_url ? (
            <StorefrontImage
              src={product.image_url}
              blurHash={product.blur_hash}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              withBlur={!isSkeleton}
              className="object-cover"
            />
          ) : (
            <ProductPlaceholder size="xl" />
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link
          href={isSkeleton ? "#" : `/products/${product.slug}`}
          onClick={(e) => {
            if (isSkeleton) e.preventDefault();
          }}
        >
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
              <AppIcon icon={Plus} size="sm" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
