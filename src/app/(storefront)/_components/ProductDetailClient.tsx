"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  Heart,
  Minus,
  Plus,
  Share2,
  Star,
  Trash2,
  Truck,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { useCartStore } from "@/app/_store/cart-store";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { AppIcon } from "@/components/icons/AppIcon";
import { STOREFRONT_CONTAINER_BLEED } from "@/config/layout";
import { FREE_DELIVERY_THRESHOLD } from "@/config/brand";
import { notifyFormSuccess } from "@/app/utils/form-notify";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import { resolveProductDescription } from "@/lib/i18n/product-description";
import { resolveCategoryName } from "@/lib/i18n/category-name";
import { productCover } from "@/lib/products/gallery";
import { productCompareAtPrice, productDiscountBadge } from "@/lib/products/pricing";
import { getProductReviewsAction } from "@/app/_actions/review-actions";
import { getProductQuestionsAction } from "@/app/_actions/question-actions";
import { ProductGallery } from "@/app/(storefront)/_components/ProductGallery";
import { SimilarProductsSection } from "@/app/(storefront)/_components/SimilarProductsSection";
import { SizeVariantChips } from "@/app/(storefront)/_components/SizeVariantChips";
import { ProductReviewsSection } from "@/app/(storefront)/_components/ProductReviewsSection";
import { ProductQuestionsSection } from "@/app/(storefront)/_components/ProductQuestionsSection";

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

function AtAGlanceGrid({ features }: { features: NonNullable<Product["features"]> }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {features.map((feature) => (
        <div
          key={feature.id}
          className="flex items-center gap-2.5 rounded-xl border border-line-soft bg-card p-3"
        >
          <span className="h-[22px] w-[22px] shrink-0 rounded-[7px] bg-bg-tile" />
          <div className="min-w-0 text-start">
            <p className="truncate text-[10px] text-text-faint">{feature.label}</p>
            <p className="mt-0.5 truncate text-[11.5px] font-semibold">{feature.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RatingSummary({
  average,
  count,
  questionsCount,
}: {
  average: number;
  count: number;
  questionsCount: number;
}) {
  const { t } = useTranslations();
  if (count <= 0 && questionsCount <= 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-text-dim">
      {count > 0 && (
        <span className="inline-flex items-center gap-1.5">
          <AppIcon icon={Star} size="xs" className="fill-current text-accent-gold" />
          {t("product.reviewsCount", { average: average.toFixed(1), count })}
        </span>
      )}
      {questionsCount > 0 && <span>{t("product.questionsCount", { count: questionsCount })}</span>}
    </div>
  );
}

function DeliveryServiceCard() {
  const { t } = useTranslations();
  const rows = [
    { title: t("product.sameDayDelivery"), note: t("product.sameDayDeliveryNote") },
    { title: t("product.easyReturns"), note: t("product.easyReturnsNote") },
    { title: t("product.pickupInStore"), note: t("product.pickupInStoreNote") },
  ];
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-line-soft bg-card p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-text-faint">
        {t("product.deliveryServiceTitle")}
      </p>
      {rows.map((row, index) => (
        <div
          key={row.title}
          className={cn(
            "flex items-center gap-2.5",
            index > 0 && "border-t border-line-soft pt-2.5",
          )}
        >
          <span className="h-6 w-6 shrink-0 rounded-lg bg-bg-tile" />
          <div className="min-w-0 text-start">
            <p className="truncate text-[11.5px] font-semibold">{row.title}</p>
            <p className="truncate text-[10px] text-text-faint">{row.note}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function SpecificationsTable({ features }: { features: NonNullable<Product["features"]> }) {
  return (
    <dl>
      {features.map((feature) => (
        <div
          key={feature.id}
          className="flex items-center justify-between gap-4 border-b border-border py-3 text-sm last:border-b-0"
        >
          <dt className="text-muted">{feature.label}</dt>
          <dd className="text-start font-medium">{feature.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProductCartControl({
  product,
  isSkeleton,
  cover,
}: {
  product: Product;
  isSkeleton?: boolean;
  cover: ReturnType<typeof productCover>;
}) {
  const { t } = useTranslations();
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const cartQuantity = useCartStore(
    (s) => s.items.find((i) => i.productId === product.id)?.quantity ?? 0,
  );
  const inStock = product.stock > 0;

  if (cartQuantity <= 0) {
    return (
      <Button
        type="button"
        fullWidth
        size="md"
        disabled={isSkeleton || !inStock}
        onClick={() => {
          if (isSkeleton || !inStock) return;
          addItem(
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: Number(product.price),
              currency: product.currency,
              imageUrl: cover?.image_url ?? product.image_url,
              blurHash: cover?.blur_hash ?? product.blur_hash,
              stock: product.stock,
            },
            1,
          );
          notifyFormSuccess(t("notifications.addedToCart"));
        }}
      >
        <span className="truncate">
          {inStock ? t("product.addToCartSimple") : t("product.outOfStock")}
        </span>
      </Button>
    );
  }

  return (
    <div className="flex h-11 w-full items-center justify-between rounded-xl border border-border bg-surface-elevated px-2">
      <button
        type="button"
        disabled={isSkeleton}
        aria-label={cartQuantity <= 1 ? t("product.removeFromCart") : undefined}
        onClick={() => {
          if (isSkeleton) return;
          if (cartQuantity <= 1) removeItem(product.id);
          else updateQuantity(product.id, cartQuantity - 1);
        }}
        className="flex h-8 w-9 items-center justify-center text-danger"
      >
        <AppIcon icon={cartQuantity <= 1 ? Trash2 : Minus} size="sm" />
      </button>
      <span className="price-num text-base font-bold">{cartQuantity}</span>
      <button
        type="button"
        disabled={isSkeleton || cartQuantity >= product.stock}
        onClick={() => {
          if (isSkeleton) return;
          updateQuantity(product.id, Math.min(cartQuantity + 1, product.stock || cartQuantity + 1));
        }}
        className="flex h-8 w-9 items-center justify-center text-accent-teal disabled:opacity-40"
      >
        <AppIcon icon={Plus} size="sm" />
      </button>
    </div>
  );
}

export function ProductDetailClient({ product, isSkeleton = false }: Props) {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const wishlisted = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const [descOpen, setDescOpen] = useState(true);
  const [tab, setTab] = useState<"specs" | "reviews" | "questions" | "similar">("specs");
  const { t, locale, dir } = useTranslations();
  const formatPrice = useFormatPrice();
  const { showPrices } = useStoreSettings();

  const { data: reviewsSummary } = useQuery({
    queryKey: ["product-reviews", product.id],
    enabled: !isSkeleton,
    queryFn: async () => {
      const result = await getProductReviewsAction(product.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
  const { data: questionsList } = useQuery({
    queryKey: ["product-questions", product.id],
    enabled: !isSkeleton,
    queryFn: async () => {
      const result = await getProductQuestionsAction(product.id);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });
  const reviewsCount = reviewsSummary?.count ?? 0;
  const questionsCount = questionsList?.length ?? 0;

  const description =
    resolveProductDescription(product, locale) ?? t("product.noDescription");
  const subtitle = resolveProductSubtitle(product, locale);
  const inStock = product.stock > 0;
  const cover = productCover(product);
  const compareAt = productCompareAtPrice(product);
  const discountBadge = productDiscountBadge(product, formatPrice);
  const badgeLabel = product.campaign?.badge?.trim() || null;
  const buyNowLabel = t("product.buyNow", {
    price: formatPrice(Number(product.price), product.currency),
  });
  const features = product.features ?? [];
  const glanceFeatures = features.slice(0, 6);
  const categoryName = product.category ? resolveCategoryName(product.category, locale) : null;

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

  const buyNow = () => {
    if (isSkeleton || !inStock) return;
    const alreadyInCart = useCartStore
      .getState()
      .items.some((i) => i.productId === product.id);
    if (!alreadyInCart) {
      addItem(
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          price: Number(product.price),
          currency: product.currency,
          imageUrl: cover?.image_url ?? product.image_url,
          blurHash: cover?.blur_hash ?? product.blur_hash,
          stock: product.stock,
        },
        1,
      );
    }
    router.push("/checkout");
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
            <ProductGallery product={product} isSkeleton={isSkeleton} sizes="100vw" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 to-transparent" />
            {!isSkeleton && discountBadge && (
              <span className="absolute start-3 top-14 z-10 rounded-md bg-accent-gold px-2 py-1 text-xs font-bold text-bg-main">
                {discountBadge}
              </span>
            )}
            </div>

            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pb-2 pt-3">
              <Link
                href={isSkeleton ? "#" : "/"}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white"
                onClick={(e) => {
                  if (isSkeleton) e.preventDefault();
                }}
                aria-label={t("common.back")}
              >
                <AppIcon icon={ChevronLeft} size="md" className="rtl:rotate-180" />
              </Link>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={isSkeleton}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/60 text-white"
                  aria-label={t("product.share")}
                  onClick={() => void shareProduct()}
                >
                  <AppIcon icon={Share2} size="sm" />
                </button>
                <button
                  type="button"
                  disabled={isSkeleton}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-black/60 ${wishlisted ? "text-red-400" : "text-white"}`}
                  aria-label={t("product.wishlist")}
                  onClick={() =>
                    toggleWishlist({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      imageUrl: cover?.image_url ?? product.image_url,
                    })
                  }
                >
                  <AppIcon icon={Heart} size="sm" />
                </button>
              </div>
            </div>

          </div>

          <div className="relative z-10 -mt-5 rounded-t-[1.75rem] bg-background px-4 pb-4 pt-5">
            <div className="space-y-4">
            <div>
              {(badgeLabel || product.sku) && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {badgeLabel && (
                    <span className="inline-block rounded-md border border-gold-wash-border bg-gold-wash-bg px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-accent-gold">
                      {badgeLabel}
                    </span>
                  )}
                  {product.sku && (
                    <span className="font-mono text-[10.5px] text-text-dim">
                      {t("product.sku", { sku: product.sku })}
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-logo text-start text-2xl font-bold leading-tight">{product.name}</h1>
              {subtitle && <p className="mt-1 text-start text-sm text-muted">{subtitle}</p>}
              <div className="mt-1.5">
                <RatingSummary
                  average={reviewsSummary?.average ?? 0}
                  count={reviewsCount}
                  questionsCount={questionsCount}
                />
              </div>
            </div>

            <SizeVariantChips productId={product.id} currentProductId={product.id} />

            <div>
              <div className="flex items-start justify-between gap-4">
                {showPrices ? (
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <Price
                      amount={Number(product.price)}
                      currency={product.currency}
                      className="text-start text-3xl font-bold tracking-tight text-accent-teal"
                    />
                    {compareAt != null && (
                      <span className="price-num text-start text-sm text-muted line-through tabular-nums">
                        {formatPrice(compareAt, product.currency)}
                      </span>
                    )}
                    {discountBadge && (
                      <span className="rounded-md bg-accent-gold px-1.5 py-0.5 text-xs font-semibold text-bg-main">
                        {discountBadge}
                      </span>
                    )}
                  </div>
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

            {inStock && (
              <div className="space-y-1.5 rounded-2xl border border-gold-hairline bg-card p-3.5">
                <p className="flex items-center gap-2 text-start text-xs font-medium text-accent-teal">
                  <AppIcon icon={CheckCircle2} size="xs" />
                  {t("product.inStockCount", { count: product.stock })}
                </p>
                <p className="flex items-center gap-2 text-start text-xs text-text-faint">
                  <AppIcon icon={Truck} size="xs" className="text-accent-gold" />
                  {t("product.freeDeliveryOver", {
                    amount: formatPrice(FREE_DELIVERY_THRESHOLD),
                  })}
                </p>
              </div>
            )}

            <DeliveryServiceCard />

            {glanceFeatures.length > 0 && (
              <div>
                <p className="mb-2 text-start text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("product.atAGlance")}
                </p>
                <AtAGlanceGrid features={glanceFeatures} />
              </div>
            )}

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

            <div>
              <div className="flex gap-5 overflow-x-auto whitespace-nowrap border-b border-border text-sm font-medium">
                <button
                  type="button"
                  className={cn(
                    "-mb-px shrink-0 border-b-2 pb-2.5",
                    tab === "specs" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
                  )}
                  onClick={() => setTab("specs")}
                >
                  {t("product.features")}
                </button>
                <button
                  type="button"
                  className={cn(
                    "-mb-px shrink-0 border-b-2 pb-2.5",
                    tab === "reviews" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
                  )}
                  onClick={() => setTab("reviews")}
                >
                  {t("product.reviewsTab", { count: reviewsCount })}
                </button>
                <button
                  type="button"
                  className={cn(
                    "-mb-px shrink-0 border-b-2 pb-2.5",
                    tab === "questions" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
                  )}
                  onClick={() => setTab("questions")}
                >
                  {t("product.questionsTab", { count: questionsCount })}
                </button>
                <button
                  type="button"
                  className={cn(
                    "-mb-px shrink-0 border-b-2 pb-2.5",
                    tab === "similar" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
                  )}
                  onClick={() => setTab("similar")}
                >
                  {t("product.similarProducts")}
                </button>
              </div>
              <div className="pt-4">
                {tab === "specs" &&
                  (features.length > 0 ? (
                    <SpecificationsTable features={features} />
                  ) : (
                    <p className="py-4 text-center text-sm text-muted">{t("product.noFeatures")}</p>
                  ))}
                {tab === "reviews" && (
                  <ProductReviewsSection productId={product.id} productSlug={product.slug} />
                )}
                {tab === "questions" && (
                  <ProductQuestionsSection productId={product.id} productSlug={product.slug} />
                )}
                {tab === "similar" && (
                  <SimilarProductsSection
                    categoryId={product.category_id}
                    excludeProductId={product.id}
                  />
                )}
              </div>
            </div>

            {product.category_id && (
              <div>
                <div className="mb-2 flex items-baseline gap-3">
                  <p className="text-start text-sm font-bold">
                    {t("product.frequentlyBoughtTogether")}
                  </p>
                  <button
                    type="button"
                    className="ms-auto text-xs text-accent-teal"
                    onClick={() => setTab("similar")}
                  >
                    {t("product.seeAll")}
                  </button>
                </div>
                <SimilarProductsSection
                  categoryId={product.category_id}
                  excludeProductId={product.id}
                  limit={3}
                />
              </div>
            )}
            </div>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-background px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <ProductCartControl product={product} isSkeleton={isSkeleton} cover={cover} />
        </div>
      </div>

      {/* Desktop layout */}
      <div className={cn("hidden md:block", isSkeleton && "skeleton")} aria-busy={isSkeleton}>
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-muted lg:pt-4">
          <Link href={isSkeleton ? "#" : "/"} className="hover:text-foreground">
            {t("product.breadcrumbHome")}
          </Link>
          {categoryName && product.category && (
            <>
              <AppIcon icon={ChevronLeft} size="xs" className="rotate-180 rtl:rotate-0" />
              <Link
                href={isSkeleton ? "#" : `/categories/${product.category.slug}`}
                className="hover:text-foreground"
              >
                {categoryName}
              </Link>
            </>
          )}
          <AppIcon icon={ChevronLeft} size="xs" className="rotate-180 rtl:rotate-0" />
          <span className="truncate text-foreground">{product.name}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr_0.82fr] lg:gap-8">
          {/* Column 1: gallery */}
          <div className="relative lg:sticky lg:top-24 lg:self-start">
            {!isSkeleton && discountBadge && (
              <span className="absolute start-2 top-2 z-10 rounded-md bg-accent-gold px-2 py-1 text-xs font-bold text-bg-main">
                {discountBadge}
              </span>
            )}
            {!isSkeleton && (
              <div className="absolute end-2 top-2 z-10 flex flex-col gap-2">
                <button
                  type="button"
                  aria-label={t("product.wishlist")}
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-field bg-black/60",
                    wishlisted ? "text-red-400" : "text-accent-gold",
                  )}
                  onClick={() =>
                    toggleWishlist({
                      productId: product.id,
                      name: product.name,
                      slug: product.slug,
                      imageUrl: cover?.image_url ?? product.image_url,
                    })
                  }
                >
                  <AppIcon icon={Heart} size="sm" />
                </button>
                <button
                  type="button"
                  aria-label={t("product.share")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line-field bg-black/60 text-text-dim"
                  onClick={() => void shareProduct()}
                >
                  <AppIcon icon={Share2} size="sm" />
                </button>
              </div>
            )}
            <ProductGallery
              product={product}
              isSkeleton={isSkeleton}
              sizes="50vw"
              showThumbs
              thumbsLayout="start"
            />
          </div>

          {/* Column 2: title, meta, size, at-a-glance, description */}
          <div className="flex flex-col gap-4">
            <div>
              {(badgeLabel || product.sku) && (
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  {badgeLabel && (
                    <span className="inline-block rounded-md border border-gold-wash-border bg-gold-wash-bg px-2 py-0.5 text-[10.5px] font-bold uppercase tracking-wide text-accent-gold">
                      {badgeLabel}
                    </span>
                  )}
                  {product.sku && (
                    <span className="font-mono text-[10.5px] text-text-dim">
                      {t("product.sku", { sku: product.sku })}
                    </span>
                  )}
                </div>
              )}
              <h1 className="font-logo text-3xl font-bold">{product.name}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
              <div className="mt-1.5">
                <RatingSummary
                  average={reviewsSummary?.average ?? 0}
                  count={reviewsCount}
                  questionsCount={questionsCount}
                />
              </div>
            </div>

            <SizeVariantChips productId={product.id} currentProductId={product.id} />

            {glanceFeatures.length > 0 && (
              <div>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {t("product.atAGlance")}
                </p>
                <AtAGlanceGrid features={glanceFeatures} />
              </div>
            )}

            <div className="border-t border-line-soft pt-4">
              <p className="mb-1.5 text-sm font-medium">{t("product.description")}</p>
              <p className="text-base leading-7 text-muted">{description}</p>
            </div>
          </div>

          {/* Column 3: price + buy box + delivery & service */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
            <div className="space-y-4 rounded-2xl border border-gold-hairline bg-card p-4">
              {showPrices ? (
                <div>
                  {compareAt != null && (
                    <div className="mb-1 flex items-center gap-2">
                      <span className="price-num text-[13px] text-muted line-through tabular-nums">
                        {formatPrice(compareAt, product.currency)}
                      </span>
                      {discountBadge && (
                        <span className="rounded-md bg-accent-gold px-1.5 py-0.5 text-[10px] font-bold text-bg-main">
                          {discountBadge}
                        </span>
                      )}
                    </div>
                  )}
                  <Price
                    amount={Number(product.price)}
                    currency={product.currency}
                    className="text-[26px] font-bold text-accent-teal"
                  />
                  <p className="mt-0.5 text-[10.5px] text-text-faint">{t("product.vatIncluded")}</p>
                </div>
              ) : (
                <p className="text-sm text-muted">{t("store.pricesHidden")}</p>
              )}

              <div className="space-y-1.5 border-b border-line-soft pb-3.5">
                {inStock ? (
                  <p className="flex items-center gap-2 text-sm font-medium text-accent-teal">
                    <AppIcon icon={CheckCircle2} size="sm" />
                    {t("product.inStockCount", { count: product.stock })}
                  </p>
                ) : (
                  <p className="flex items-center gap-2 text-sm font-medium text-danger">
                    {t("product.outOfStock")}
                  </p>
                )}
                <p className="flex items-center gap-2 text-xs text-text-faint">
                  <AppIcon icon={Truck} size="xs" className="text-accent-gold" />
                  {t("product.freeDeliveryOver", {
                    amount: formatPrice(FREE_DELIVERY_THRESHOLD),
                  })}
                </p>
              </div>

              <ProductCartControl product={product} isSkeleton={isSkeleton} cover={cover} />
              {showPrices && (
                <button
                  type="button"
                  disabled={isSkeleton || !inStock}
                  onClick={buyNow}
                  className="flex h-10 w-full items-center justify-center rounded-xl border border-gold-wash-border text-[13px] font-semibold text-[#e0d6bd] disabled:opacity-50"
                >
                  {buyNowLabel}
                </button>
              )}
            </div>

            <DeliveryServiceCard />
          </div>
        </div>

        <div className="mt-10 lg:mt-14">
          <div className="flex gap-6 border-b border-border text-sm font-medium">
            <button
              type="button"
              className={cn(
                "-mb-px border-b-2 pb-3",
                tab === "specs" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
              )}
              onClick={() => setTab("specs")}
            >
              {t("product.features")}
            </button>
            <button
              type="button"
              className={cn(
                "-mb-px border-b-2 pb-3",
                tab === "reviews" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
              )}
              onClick={() => setTab("reviews")}
            >
              {t("product.reviewsTab", { count: reviewsCount })}
            </button>
            <button
              type="button"
              className={cn(
                "-mb-px border-b-2 pb-3",
                tab === "questions" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
              )}
              onClick={() => setTab("questions")}
            >
              {t("product.questionsTab", { count: questionsCount })}
            </button>
            <button
              type="button"
              className={cn(
                "-mb-px border-b-2 pb-3",
                tab === "similar" ? "border-accent-teal text-accent-teal" : "border-transparent text-muted",
              )}
              onClick={() => setTab("similar")}
            >
              {t("product.similarProducts")}
            </button>
          </div>
          <div className="pt-6">
            {tab === "specs" &&
              (features.length > 0 ? (
                <div className="max-w-xl">
                  <SpecificationsTable features={features} />
                </div>
              ) : (
                <p className="py-4 text-sm text-muted">{t("product.noFeatures")}</p>
              ))}
            {tab === "reviews" && (
              <div className="max-w-xl">
                <ProductReviewsSection productId={product.id} productSlug={product.slug} />
              </div>
            )}
            {tab === "questions" && (
              <div className="max-w-xl">
                <ProductQuestionsSection productId={product.id} productSlug={product.slug} />
              </div>
            )}
            {tab === "similar" && (
              <SimilarProductsSection
                categoryId={product.category_id}
                excludeProductId={product.id}
              />
            )}
          </div>
        </div>

        {product.category_id && (
          <div className="mt-10 lg:mt-14">
            <div className="mb-3 flex items-baseline gap-3">
              <p className="text-sm font-bold">{t("product.frequentlyBoughtTogether")}</p>
              <button
                type="button"
                className="ms-auto text-xs text-accent-teal"
                onClick={() => setTab("similar")}
              >
                {t("product.seeAll")}
              </button>
            </div>
            <SimilarProductsSection
              categoryId={product.category_id}
              excludeProductId={product.id}
              limit={3}
            />
          </div>
        )}
      </div>
    </main>
  );
}
