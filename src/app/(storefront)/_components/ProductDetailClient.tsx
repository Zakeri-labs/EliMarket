"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

type Props = {
  product: Product;
  isSkeleton?: boolean;
};

export function ProductDetailClient({ product, isSkeleton = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [qty, setQty] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();

  const lineTotal = Number(product.price) * qty;
  const description = product.description ?? t("product.noDescription");

  return (
    <main className="flex min-h-full flex-col pb-8 md:pb-12">
      <div className="flex items-center justify-between py-3 md:hidden">
        <Link
          href={isSkeleton ? "#" : "/"}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          onClick={(e) => {
            if (isSkeleton) e.preventDefault();
          }}
        >
          <AppIcon icon={ChevronRight} size="md" className="rtl:rotate-180" />
        </Link>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isSkeleton}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          >
            <AppIcon icon={Share2} size="sm" />
          </button>
          <button
            type="button"
            disabled={isSkeleton}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-elevated"
          >
            <AppIcon icon={Heart} size="sm" />
          </button>
        </div>
      </div>

      <div
        className={cn(
          "grid gap-8 lg:grid-cols-2 lg:gap-12 lg:pt-4",
          isSkeleton && "skeleton",
        )}
        aria-busy={isSkeleton}
      >
        <div className="target relative aspect-square overflow-hidden rounded-2xl bg-surface-elevated lg:sticky lg:top-24 lg:self-start">
          {product.image_url ? (
            <StorefrontImage
              src={product.image_url}
              blurHash={product.blur_hash}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              withBlur={!isSkeleton}
              className="object-cover"
            />
          ) : (
            <ProductPlaceholder size="2xl" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">{product.name}</h1>
              {product.category && (
                <p className="mt-1 text-sm text-muted">{product.category.name}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              {showPrices ? (
                <p className="text-2xl font-bold text-accent md:text-3xl">
                  {formatPrice(Number(product.price), product.currency)}
                </p>
              ) : (
                <p className="text-sm text-muted">{t("store.pricesHidden")}</p>
              )}
              {product.stock > 0 ? (
                <span className="text-sm text-success">{t("product.inStock")}</span>
              ) : (
                <span className="text-sm text-danger">{t("product.outOfStock")}</span>
              )}
            </div>

            <button
              type="button"
              disabled={isSkeleton}
              className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
              onClick={() => {
                if (isSkeleton) return;
                setDescOpen(!descOpen);
              }}
            >
              <span>{t("product.description")}</span>
              <AppIcon
                icon={ChevronDown}
                size="sm"
                className={cnChevron(descOpen)}
              />
            </button>
            {descOpen && (
              <p className="text-sm leading-7 text-muted md:text-base">{description}</p>
            )}
          </div>

          {showPrices && (
            <div className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-4 md:static lg:mt-auto">
              <div className="flex items-center justify-center gap-4">
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-elevated"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(Math.max(1, qty - 1));
                  }}
                >
                  <AppIcon icon={Minus} size="sm" />
                </button>
                <span className="min-w-[2rem] text-center text-lg font-bold">{qty}</span>
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-elevated"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(qty + 1);
                  }}
                >
                  <AppIcon icon={Plus} size="sm" />
                </button>
              </div>
              <Button
                type="button"
                fullWidth
                size="lg"
                disabled={isSkeleton || product.stock <= 0}
                onClick={() => {
                  if (isSkeleton) return;
                  for (let i = 0; i < qty; i++) {
                    addItem({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      price: Number(product.price),
                      currency: product.currency,
                      imageUrl: product.image_url,
                      blurHash: product.blur_hash,
                    });
                  }
                }}
              >
                {t("product.addToCart", {
                  price: formatPrice(lineTotal, product.currency),
                })}
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function cnChevron(open: boolean) {
  return open ? "text-muted" : "-rotate-90 rtl:rotate-90 text-muted";
}
