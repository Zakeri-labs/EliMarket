"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { notifyFormSuccess } from "@/app/utils/form-notify";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { Button } from "@/components/ui/Button";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductCardExcerpt } from "@/lib/i18n/product-description";
import { productCover } from "@/lib/products/gallery";
import {
  productCompareAtPrice,
  productDiscountPercent,
} from "@/lib/products/pricing";

type Props = {
  product: Product;
  isSkeleton?: boolean;
  priority?: boolean;
  className?: string;
  layout?: "rail" | "grid";
};

export function ProductDealCard({
  product,
  isSkeleton = false,
  priority = false,
  className,
  layout = "rail",
}: Props) {
  const formatPrice = useFormatPrice();
  const { locale, dir, t } = useTranslations();
  const addItem = useCartStore((s) => s.addItem);
  const { showPrices } = useStoreSettings();
  const [mounted, setMounted] = useState(false);
  const discount = productDiscountPercent(product);
  const compareAt = productCompareAtPrice(product);
  const excerpt = resolveProductCardExcerpt(product, locale);
  const cover = productCover(product);
  const inStock = product.stock > 0;
  const hideAddButton = mounted && !showPrices;

  useEffect(() => {
    setMounted(true);
  }, []);

  const addToCart = () => {
    if (isSkeleton || !inStock || !showPrices) return;
    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: Number(product.price),
      currency: product.currency,
        imageUrl: cover?.image_url ?? product.image_url,
        blurHash: cover?.blur_hash ?? product.blur_hash,
      stock: product.stock,
    });
    notifyFormSuccess(t("notifications.addedToCart"));
  };

  return (
    <article
      dir={dir}
      className={cn(
        "flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2.5",
        layout === "rail" ? "w-36 sm:w-40" : "w-full",
        isSkeleton && "skeleton",
        className,
      )}
      aria-busy={isSkeleton}
    >
      <Link
        href={isSkeleton ? "#" : `/products/${product.slug}`}
        className="relative block shrink-0"
        onClick={(e) => {
          if (isSkeleton) e.preventDefault();
        }}
      >
        {!isSkeleton && discount != null && (
          <span className="absolute start-0 top-0 z-10 rounded-md bg-[#8B7355] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            −{discount}%
          </span>
        )}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-transparent">
          {cover ? (
            <StorefrontImage
              src={cover.image_url}
              blurHash={cover.blur_hash}
              alt={product.name}
              fill
              priority={priority}
              sizes={layout === "grid" ? "(max-width: 640px) 50vw, 200px" : "160px"}
              withBlur={false}
              className="bg-transparent object-contain"
            />
          ) : (
            <ProductPlaceholder size="lg" />
          )}
        </div>
      </Link>

      <div className="mt-2 flex min-h-0 flex-1 flex-col text-start">
        <p className="line-clamp-2 min-h-8 text-xs font-medium leading-4">{product.name}</p>
        {excerpt ? (
          <p className="mt-0.5 line-clamp-2 min-h-7 text-[10px] leading-snug text-muted">
            {excerpt}
          </p>
        ) : (
          <p className="mt-0.5 min-h-7" aria-hidden />
        )}
        <div className="mt-1.5 flex min-h-8 flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-sm font-bold">
            {formatPrice(Number(product.price), product.currency)}
          </span>
          {compareAt != null && (
            <span className="text-[10px] text-muted line-through">
              {formatPrice(compareAt, product.currency)}
            </span>
          )}
        </div>
        <div className="mt-auto pt-2">
          <Button
            type="button"
            size="sm"
            fullWidth
            disabled={isSkeleton || !inStock || hideAddButton}
            className={cn("target", hideAddButton && "invisible")}
            onClick={addToCart}
          >
            <AppIcon icon={ShoppingCart} size="xs" className="me-1" />
            <span>
              {inStock ? t("product.addToCartSimple") : t("product.outOfStock")}
            </span>
          </Button>
        </div>
      </div>
    </article>
  );
}
