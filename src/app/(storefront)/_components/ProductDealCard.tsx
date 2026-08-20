"use client";

import Link from "next/link";
import type { Product } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductCardExcerpt } from "@/lib/i18n/product-description";
import {
  productCompareAtPrice,
  productDiscountPercent,
} from "@/lib/products/pricing";

type Props = {
  product: Product;
  isSkeleton?: boolean;
  priority?: boolean;
  className?: string;
};

export function ProductDealCard({
  product,
  isSkeleton = false,
  priority = false,
  className,
}: Props) {
  const formatPrice = useFormatPrice();
  const { locale, dir } = useTranslations();
  const discount = productDiscountPercent(product);
  const compareAt = productCompareAtPrice(product);
  const excerpt = resolveProductCardExcerpt(product, locale);

  return (
    <article
      dir={dir}
      className={cn(
        "flex w-36 shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-surface p-2.5 sm:w-40",
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
        {!isSkeleton && discount != null && (
          <span className="absolute start-0 top-0 z-10 rounded-md bg-[#8B7355] px-1.5 py-0.5 text-[10px] font-semibold text-white">
            −{discount}%
          </span>
        )}
        <div className="relative flex h-32 items-center justify-center overflow-hidden rounded-xl bg-transparent sm:h-36">
          {product.image_url ? (
            <StorefrontImage
              src={product.image_url}
              blurHash={product.blur_hash}
              alt={product.name}
              width={128}
              height={128}
              priority={priority}
              sizes="160px"
              withBlur={false}
              className="max-h-full max-w-full bg-transparent object-contain"
            />
          ) : (
            <ProductPlaceholder size="lg" />
          )}
        </div>
      </Link>

      <div className="mt-2 min-w-0 text-start">
        <p className="line-clamp-1 text-xs font-medium">{product.name}</p>
        {excerpt && (
          <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted">{excerpt}</p>
        )}
        <div className="mt-1.5 flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
          <span className="text-sm font-bold">
            {formatPrice(Number(product.price), product.currency)}
          </span>
          {compareAt != null && (
            <span className="text-[10px] text-muted line-through">
              {formatPrice(compareAt, product.currency)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
