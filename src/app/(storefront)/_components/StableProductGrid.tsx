"use client";

import { useLayoutEffect, useRef, useState } from "react";
import type { Product } from "@/app/_types/database.types";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  products: Product[];
  isSkeleton?: boolean;
  /** Minimum card slots so the grid never collapses below a 2-row footprint. */
  minSlots?: number;
  className?: string;
  priorityCount?: number;
  emptyMessage?: string;
};

/**
 * Product grid that resists layout shift when filters change:
 * - keeps a floor of `minSlots` cells
 * - ratchets min-height upward so the section does not shrink on filter-down
 * - empty state overlays the reserved area instead of replacing the grid
 */
export function StableProductGrid({
  products,
  isSkeleton = false,
  minSlots = 6,
  className,
  priorityCount = 4,
  emptyMessage,
}: Props) {
  const { t } = useTranslations();
  const rootRef = useRef<HTMLDivElement>(null);
  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);
  const slotCount = Math.max(minSlots, products.length || minSlots);
  const showEmpty = !isSkeleton && products.length === 0;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const height = el.getBoundingClientRect().height;
    if (height <= 0) return;
    setMinHeight((prev) => (prev == null ? height : Math.max(prev, height)));
  }, [products, isSkeleton, slotCount]);

  return (
    <div
      ref={rootRef}
      className="relative"
      style={minHeight ? { minHeight } : undefined}
    >
      <div
        className={cn(
          "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5",
          className,
        )}
      >
        {Array.from({ length: slotCount }, (_, index) => {
          const product = products[index];
          if (product) {
            return (
              <ProductDealCard
                key={product.id}
                product={product}
                isSkeleton={isSkeleton}
                priority={index < priorityCount}
                layout="grid"
              />
            );
          }
          return (
            <div key={`slot-${index}`} className="invisible" aria-hidden>
              <div className="aspect-square w-full rounded-xl" />
              <div className="mt-2 min-h-8" />
              <div className="mt-0.5 min-h-7 lg:hidden" />
              <div className="mt-1.5 min-h-8" />
            </div>
          );
        })}
      </div>
      {showEmpty ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <p className="rounded-2xl border border-border bg-surface/95 px-4 py-3 text-center text-sm text-muted shadow-sm backdrop-blur-sm">
            {emptyMessage ?? t("home.noProducts")}
          </p>
        </div>
      ) : null}
    </div>
  );
}
