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
import { StripePlaceholder } from "@/components/ui/StripePlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductCardExcerpt } from "@/lib/i18n/product-description";
import { productCover } from "@/lib/products/gallery";
import {
  productCompareAtPrice,
  productDiscountBadge,
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
  const discountBadge = productDiscountBadge(product, formatPrice);
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
        "flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2.5 lg:rounded-lg",
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
        {!isSkeleton && discountBadge && (
          <span className="absolute start-0 top-0 z-10 rounded-md bg-accent-gold px-1.5 py-0.5 text-[10px] font-semibold text-bg-main">
            {discountBadge}
          </span>
        )}
        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-transparent">
          {isSkeleton ? (
            <SkeletonImage />
          ) : cover ? (
            <StorefrontImage
              src={cover.image_url}
              blurHash={cover.blur_hash}
              alt={product.name}
              fill
              priority={priority}
              sizes={layout === "grid" ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" : "160px"}
              withBlur={false}
              className="bg-transparent object-contain"
            />
          ) : (
            <StripePlaceholder className="absolute inset-0" />
          )}
        </div>
      </Link>

      <div className="mt-2 flex min-h-0 flex-1 flex-col text-start">
        <p className="line-clamp-2 min-h-8 text-xs font-medium leading-4 lg:text-sm lg:font-semibold">
          {product.name}
        </p>
        {excerpt ? (
          <p className="mt-0.5 line-clamp-2 min-h-7 text-[10px] leading-snug text-muted lg:hidden">
            {excerpt}
          </p>
        ) : (
          <p className="mt-0.5 min-h-7 lg:hidden" aria-hidden />
        )}
        <p className="mt-0.5 hidden text-xs text-muted lg:block">
          {t(
            product.inventory_unit === "weight"
              ? "product.unitWeight"
              : product.inventory_unit === "pack"
                ? "product.unitPack"
                : "product.unitCount",
          )}
        </p>
        <div className="mt-1.5 flex min-h-8 flex-wrap items-baseline gap-x-1.5 gap-y-0.5 tabular-nums">
          <Price
            amount={Number(product.price)}
            currency={product.currency}
            className="text-sm font-bold text-accent-teal"
          />
          {compareAt != null && (
            <span className="price-num text-[10px] text-price-strike line-through">
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
            className={cn(
              "target md:rounded-lg md:border md:border-accent-teal md:bg-transparent md:text-accent-teal md:shadow-none md:hover:bg-accent-teal/10",
              hideAddButton && "invisible",
            )}
            onClick={addToCart}
          >
            <AppIcon icon={ShoppingCart} size="xs" className="me-1 lg:hidden" />
            <span className="lg:hidden">
              {inStock ? t("product.addToCartSimple") : t("product.outOfStock")}
            </span>
            <span className="hidden lg:inline">
              {inStock ? t("product.addShort") : t("product.outOfStock")}
            </span>
          </Button>
        </div>
      </div>
    </article>
  );
}
