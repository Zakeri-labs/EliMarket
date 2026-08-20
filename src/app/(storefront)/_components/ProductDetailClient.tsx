"use client";

import Link from "next/link";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  Share2,
} from "lucide-react";
import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { useCartStore } from "@/app/_store/cart-store";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { STOREFRONT_CONTAINER_BLEED } from "@/config/layout";
import { notifyFormSuccess } from "@/app/utils/form-notify";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductDescription } from "@/lib/i18n/product-description";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type Props = {
  product: Product;
  isSkeleton?: boolean;
};

const SIZE_LABEL_PATTERN =
  /^(weight|size|volume|package|وزن|حجم|اندازه|الوزن|الحجم|الحجم\/الوزن)$/i;

function resolveProductSubtitle(product: Product, locale: Locale): string | null {
  const sizeFeature = product.features?.find((feature) =>
    SIZE_LABEL_PATTERN.test(feature.label.trim()),
  );
  if (sizeFeature?.value.trim()) return sizeFeature.value.trim();
  if (product.brand?.name) return product.brand.name;
  if (product.category) return resolveCategoryName(product.category, locale);
  return null;
}

export function ProductDetailClient({ product, isSkeleton = false }: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [qty, setQty] = useState(1);
  const [descOpen, setDescOpen] = useState(true);
  const { t, locale, dir } = useTranslations();
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();

  const lineTotal = Number(product.price) * qty;
  const description =
    resolveProductDescription(product, locale) ?? t("product.noDescription");
  const subtitle = resolveProductSubtitle(product, locale);
  const inStock = product.stock > 0;
  const addToCartLabel = showPrices
    ? t("product.addToCart", {
        price: formatPrice(lineTotal, product.currency),
      })
    : t("product.addToCartSimple");

  const shareProduct = async () => {
    if (isSkeleton || typeof window === "undefined") return;
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
    } catch {
      return;
    }
    await navigator.clipboard.writeText(url);
  };

  const addToCart = () => {
    if (isSkeleton || !inStock) return;
    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        currency: product.currency,
        imageUrl: product.image_url,
        blurHash: product.blur_hash,
        stock: product.stock,
      },
      qty,
    );
    notifyFormSuccess(t("notifications.addedToCart"));
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col md:min-h-full md:pb-12" dir={dir}>
      {/* Mobile layout */}
      <div className="flex min-h-0 flex-1 flex-col md:hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain">
          <div className={cn("relative", STOREFRONT_CONTAINER_BLEED, isSkeleton && "skeleton")}>
            <div
              className="relative aspect-[4/5] max-h-[46vh] min-h-[280px] w-full bg-transparent"
              aria-busy={isSkeleton}
            >
            {product.image_url ? (
              <StorefrontImage
                src={product.image_url}
                blurHash={product.blur_hash}
                alt={product.name}
                fill
                priority
                sizes="100vw"
                withBlur={false}
                className="bg-transparent object-contain object-center"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <ProductPlaceholder size="2xl" />
              </div>
            )}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            </div>

            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pb-2 pt-3">
              <Link
                href={isSkeleton ? "#" : "/"}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
                onClick={(e) => {
                  if (isSkeleton) e.preventDefault();
                }}
                aria-label={t("common.back")}
              >
                <AppIcon icon={ChevronLeft} size="md" className="rtl:rotate-180" />
              </Link>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-sm"
                  aria-label={t("product.share")}
                  onClick={() => void shareProduct()}
                >
                  <AppIcon icon={Share2} size="sm" />
                </button>
                <button
                  type="button"
                  disabled={isSkeleton}
                  className={`flex h-10 w-10 items-center justify-center rounded-full bg-black/35 backdrop-blur-sm ${wishlisted ? "text-red-400" : "text-white"}`}
                  aria-label={t("product.wishlist")}
                  onClick={() =>
                    toggleWishlist({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      imageUrl: product.image_url,
                    })
                  }
                >
                  <AppIcon icon={Heart} size="sm" />
                </button>
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-4 flex justify-center gap-1.5" aria-hidden>
              <span className="h-1.5 w-1.5 rounded-full bg-white" />
            </div>
          </div>

          <div className="relative z-10 -mt-5 rounded-t-[1.75rem] bg-background px-4 pb-4 pt-5">
            <div className="space-y-4">
            <div>
              <h1 className="text-start text-2xl font-bold leading-tight">{product.name}</h1>
              {subtitle && <p className="mt-1 text-start text-sm text-muted">{subtitle}</p>}
            </div>

            <div>
              <div className="flex items-start justify-between gap-4">
                {showPrices ? (
                  <p className="text-start text-3xl font-bold tracking-tight">
                    {formatPrice(Number(product.price), product.currency)}
                  </p>
                ) : (
                  <p className="text-sm text-muted">{t("store.pricesHidden")}</p>
                )}
                {inStock ? (
                  <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-accent">
                    <AppIcon icon={CheckCircle2} size="sm" />
                    {t("product.inStock")}
                  </span>
                ) : (
                  <span className="shrink-0 text-sm text-danger">{t("product.outOfStock")}</span>
                )}
              </div>
              {showPrices && (
                <p className="mt-1 text-start text-xs text-muted">{t("product.vatIncluded")}</p>
              )}
            </div>

            <div className="h-px bg-border" />

            <div>
              <button
                type="button"
                disabled={isSkeleton}
                className="flex w-full items-center justify-between py-1 text-sm font-medium"
                onClick={() => {
                  if (isSkeleton) return;
                  setDescOpen(!descOpen);
                }}
              >
                <span className="text-start">{t("product.description")}</span>
                <AppIcon
                  icon={ChevronDown}
                  size="sm"
                  className={cn("text-muted transition-transform", descOpen && "rotate-180")}
                />
              </button>
              {descOpen && (
                <p className="mt-2 text-start text-sm leading-7 text-muted">{description}</p>
              )}
            </div>

            {product.features && product.features.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="mb-3 text-start text-sm font-semibold">{t("product.features")}</p>
                <dl className="space-y-2">
                  {product.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <dt className="text-muted">{feature.label}</dt>
                      <dd className="text-start font-medium">{feature.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <div className="flex items-center justify-between gap-4 pt-1">
              <span className="text-sm font-medium">{t("product.quantity")}</span>
              <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface-elevated">
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center border-e border-border text-muted"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(Math.max(1, qty - 1));
                  }}
                >
                  <AppIcon icon={Minus} size="sm" />
                </button>
                <span className="flex h-11 min-w-11 items-center justify-center px-2 text-base font-semibold">
                  {qty}
                </span>
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center border-s border-border text-muted"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(Math.min(product.stock || 1, qty + 1));
                  }}
                >
                  <AppIcon icon={Plus} size="sm" />
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button
            type="button"
            fullWidth
            size="lg"
            disabled={isSkeleton || !inStock}
            onClick={addToCart}
          >
            {addToCartLabel}
          </Button>
        </div>
      </div>

      {/* Desktop layout */}
      <div
        className={cn(
          "hidden gap-8 md:grid lg:grid-cols-2 lg:gap-12 lg:pt-4",
          isSkeleton && "skeleton",
        )}
        aria-busy={isSkeleton}
      >
        <div className="target relative aspect-square overflow-hidden rounded-2xl bg-transparent lg:sticky lg:top-24 lg:self-start">
          {product.image_url ? (
            <StorefrontImage
              src={product.image_url}
              blurHash={product.blur_hash}
              alt={product.name}
              fill
              priority
              sizes="50vw"
              withBlur={false}
              className="bg-transparent object-contain"
            />
          ) : (
            <ProductPlaceholder size="2xl" />
          )}
        </div>

        <div className="flex flex-col">
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
            </div>

            <div className="flex items-center justify-between">
              {showPrices ? (
                <p className="text-3xl font-bold text-accent">
                  {formatPrice(Number(product.price), product.currency)}
                </p>
              ) : (
                <p className="text-sm text-muted">{t("store.pricesHidden")}</p>
              )}
              {inStock ? (
                <span className="inline-flex items-center gap-1.5 text-sm text-success">
                  <AppIcon icon={CheckCircle2} size="sm" />
                  {t("product.inStock")}
                </span>
              ) : (
                <span className="text-sm text-danger">{t("product.outOfStock")}</span>
              )}
            </div>

            {showPrices && (
              <p className="text-xs text-muted">{t("product.vatIncluded")}</p>
            )}

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
                className={cn("text-muted transition-transform", descOpen && "rotate-180")}
              />
            </button>
            {descOpen && (
              <p className="text-base leading-7 text-muted">{description}</p>
            )}

            {product.features && product.features.length > 0 && (
              <div className="rounded-2xl border border-border bg-surface p-4">
                <p className="mb-3 text-sm font-semibold">{t("product.features")}</p>
                <dl className="space-y-2">
                  {product.features.map((feature) => (
                    <div
                      key={feature.id}
                      className="flex items-start justify-between gap-4 text-sm"
                    >
                      <dt className="text-muted">{feature.label}</dt>
                      <dd className="font-medium">{feature.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          <div className="mt-8 space-y-4 rounded-2xl border border-border bg-surface p-4 lg:mt-auto">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium">{t("product.quantity")}</span>
              <div className="inline-flex overflow-hidden rounded-xl border border-border bg-surface-elevated">
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center border-e border-border"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(Math.max(1, qty - 1));
                  }}
                >
                  <AppIcon icon={Minus} size="sm" />
                </button>
                <span className="flex h-11 min-w-11 items-center justify-center px-2 text-lg font-bold">
                  {qty}
                </span>
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-11 w-11 items-center justify-center border-s border-border"
                  onClick={() => {
                    if (isSkeleton) return;
                    setQty(Math.min(product.stock || 1, qty + 1));
                  }}
                >
                  <AppIcon icon={Plus} size="sm" />
                </button>
              </div>
            </div>
            <Button
              type="button"
              fullWidth
              size="lg"
              disabled={isSkeleton || !inStock}
              onClick={addToCart}
            >
              {addToCartLabel}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
