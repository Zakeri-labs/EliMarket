"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductCardExcerpt } from "@/lib/i18n/product-description";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { productCover } from "@/lib/products/gallery";
import { productCompareAtPrice } from "@/lib/products/pricing";

type Props = { product: Product; compact?: boolean; isSkeleton?: boolean };

export function ProductCard({ product, compact, isSkeleton = false }: Props) {
  const formatPrice = useFormatPrice();
  const { locale, dir } = useTranslations();
  const excerpt = resolveProductCardExcerpt(product, locale);

  if (compact) {
    const compareAt = productCompareAtPrice(product);
    const cover = productCover(product);

    return (
      <Link
        href={isSkeleton ? "#" : `/products/${product.slug}`}
        dir={dir}
        className={cn(
          "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
          isSkeleton && "skeleton pointer-events-none",
        )}
        onClick={(e) => {
          if (isSkeleton) e.preventDefault();
        }}
        aria-busy={isSkeleton}
      >
        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-transparent">
          {cover ? (
            <StorefrontImage
              src={cover.image_url}
              blurHash={cover.blur_hash}
              alt=""
              fill
              sizes="56px"
              withBlur={false}
              className="bg-transparent object-contain p-1"
            />
          ) : (
            <ProductPlaceholder size="md" />
          )}
        </div>
        <div className="min-w-0 flex-1 text-start">
          <p className="truncate text-sm font-medium">{product.name}</p>
          {excerpt && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted">{excerpt}</p>
          )}
          <div className="mt-1 flex items-baseline gap-1.5">
            <p className="text-xs font-semibold">{formatPrice(Number(product.price))}</p>
            {compareAt != null && (
              <p className="text-[10px] text-muted line-through">{formatPrice(compareAt)}</p>
            )}
          </div>
        </div>
        <AppIcon icon={ChevronLeft} size="sm" className="text-muted rtl:rotate-180" />
      </Link>
    );
  }

  return <ProductDealCard product={product} isSkeleton={isSkeleton} />;
}
