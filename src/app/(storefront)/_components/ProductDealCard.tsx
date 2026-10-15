"use client";

import Link from "next/link";
import type { Product } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { StripePlaceholder } from "@/components/ui/StripePlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { Price } from "@/components/ui/Price";
import { ProductCartQtyControl } from "@/app/(storefront)/_components/ProductCartQtyControl";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductName } from "@/lib/i18n/product-name";
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
  const { locale, dir } = useTranslations();
  const discountBadge = productDiscountBadge(product, formatPrice);
  const compareAt = productCompareAtPrice(product);
  const name = resolveProductName(product, locale);
  const cover = productCover(product);
  return (
    <article
      dir={dir}
      className={cn(
        "relative flex shrink-0 flex-col overflow-hidden rounded-2xl bg-[linear-gradient(90deg,#d9d9d9,#e1e1e1_50%,#d9d9d9)] text-[#1a1a1a] transition-all duration-300 ease-out lg:rounded-lg",
        !isSkeleton && "hover:z-10 hover:-translate-y-1.5",
        layout === "rail" ? "w-36 sm:w-40" : "w-full",
        isSkeleton && "skeleton",
        className,
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
        {/* The studio photo is shown exactly as generated: square, full width, no overlays. */}
        <div className="relative aspect-square w-full overflow-hidden">
          {isSkeleton ? (
            <SkeletonImage />
          ) : cover ? (
            <StorefrontImage
              src={cover.image_url}
              blurHash={cover.blur_hash}
              alt={name}
              fill
              priority={priority}
              sizes={
                layout === "grid"
                  ? "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  : "160px"
              }
              withBlur={false}
              className="bg-transparent object-contain"
            />
          ) : (
            <StripePlaceholder className="absolute inset-0" />
          )}
        </div>
        {!isSkeleton && discountBadge && (
          <span className="absolute start-[4%] top-[4%] z-10 rounded-md bg-[#f1e2c6] px-2 py-0.5 text-xs font-bold text-[#3a2d14] lg:text-sm">
            {discountBadge}
          </span>
        )}
        <div className="flex h-[3.9rem] flex-col justify-center gap-0.5 ps-[7%] pe-[19%] text-start">
          <p className="line-clamp-1 text-xs font-semibold leading-4 lg:text-sm">
            {name}
          </p>
          <div data-price className="flex items-baseline gap-2 tabular-nums">
            <Price
              amount={Number(product.price)}
              currency={product.currency}
              className="text-sm font-bold text-[#111]"
            />
            {compareAt != null && (
              <Price
                amount={compareAt}
                currency={product.currency}
                className="text-[10px] text-[#777] line-through"
              />
            )}
          </div>
        </div>
      </Link>

      <div className="absolute bottom-[0.85rem] end-[4%] z-20">
        {!isSkeleton ? (
          <ProductCartQtyControl
            product={product}
            className="!border-transparent !bg-[#111] !text-white"
          />
        ) : (
          <div className="h-8 w-8" aria-hidden />
        )}
      </div>
    </article>
  );
}
