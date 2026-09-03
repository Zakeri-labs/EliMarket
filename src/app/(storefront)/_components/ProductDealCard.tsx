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
import { resolveProductCardExcerpt } from "@/lib/i18n/product-description";
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
  const excerpt = resolveProductCardExcerpt(product, locale);
  const name = resolveProductName(product, locale);
  const cover = productCover(product);

  return (
    <article
      dir={dir}
      className={cn(
        "relative flex h-full shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2.5 transition-all duration-300 ease-out lg:rounded-lg",
        !isSkeleton && "hover:z-10 hover:-translate-y-1.5 hover:shadow-xl",
        layout === "rail" ? "w-36 sm:w-40" : "w-full",
        isSkeleton && "skeleton",
        className,
      )}
      aria-busy={isSkeleton}
    >
      <div className="relative shrink-0">
        <Link
          href={isSkeleton ? "#" : `/products/${product.slug}`}
          className="relative block"
          onClick={(e) => {
            if (isSkeleton) e.preventDefault();
          }}
        >
          {!isSkeleton && discountBadge && (
            <span className="absolute start-0 top-0 z-10 rounded-md bg-accent-teal px-2 py-0.5 text-sm font-bold text-bg-main lg:text-base">
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
        </Link>

        {!isSkeleton ? (
          <div className="absolute bottom-1.5 end-1.5 z-20">
            <ProductCartQtyControl product={product} />
          </div>
        ) : (
          <div className="absolute bottom-1.5 end-1.5 z-20 h-8 w-8" aria-hidden />
        )}
      </div>

      <div className="mt-2 flex min-h-0 flex-1 flex-col text-start">
        <p className="line-clamp-2 text-xs font-medium leading-4 lg:text-sm lg:font-semibold">
          {name}
        </p>
        {excerpt ? (
          <p className="mt-0.5 line-clamp-2 min-h-7 text-[10px] leading-snug text-muted lg:hidden">
            {excerpt}
          </p>
        ) : (
          <p className="min-h-3 lg:hidden" aria-hidden />
        )}
        <div data-price className="mt-1 flex min-h-9 flex-col items-start gap-y-0.5 text-start tabular-nums">
          <Price
            amount={Number(product.price)}
            currency={product.currency}
            className="text-sm font-bold text-accent-teal"
          />
          {compareAt != null && (
            <Price
              amount={compareAt}
              currency={product.currency}
              className="text-[10px] text-price-strike line-through"
            />
          )}
        </div>
      </div>
    </article>
  );
}
