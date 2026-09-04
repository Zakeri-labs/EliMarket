"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Gift,
  Leaf,
  Package,
  Percent,
  Sparkles,
  Star,
  Truck,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { FlashDealTimer } from "@/app/(storefront)/_components/FlashDealTimer";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useTranslations } from "@/i18n/use-translations";
import { campaignSearchPath } from "@/lib/campaigns/href";
import { sortFlashDealProducts } from "@/lib/products/pricing";

const DEAL_COUNT = 15;

type Perk = {
  titleKey: "weeklySpecials" | "freeDelivery" | "freshDaily" | "bulkDiscount" | "firstOrder" | "loyaltyProgram";
  descKey:
    | "weeklySpecialsDesc"
    | "freeDeliveryDesc"
    | "freshDailyDesc"
    | "bulkDiscountDesc"
    | "firstOrderDesc"
    | "loyaltyProgramDesc";
  icon: LucideIcon;
  href: string;
  tone: "teal" | "gold";
};

const PERKS: Perk[] = [
  {
    titleKey: "weeklySpecials",
    descKey: "weeklySpecialsDesc",
    icon: Percent,
    href: "/search?sale=1",
    tone: "gold",
  },
  {
    titleKey: "freeDelivery",
    descKey: "freeDeliveryDesc",
    icon: Truck,
    href: "/categories",
    tone: "teal",
  },
  {
    titleKey: "freshDaily",
    descKey: "freshDailyDesc",
    icon: Leaf,
    href: "/categories/produce",
    tone: "teal",
  },
  {
    titleKey: "bulkDiscount",
    descKey: "bulkDiscountDesc",
    icon: Package,
    href: "/search",
    tone: "gold",
  },
  {
    titleKey: "firstOrder",
    descKey: "firstOrderDesc",
    icon: Gift,
    href: "/categories",
    tone: "gold",
  },
  {
    titleKey: "loyaltyProgram",
    descKey: "loyaltyProgramDesc",
    icon: Star,
    href: "/account",
    tone: "teal",
  },
];

export function OffersView() {
  const { t, dir, locale, messages: m } = useTranslations();
  const { data: products, isPending } = useProducts();
  const isSkeleton = isPending;
  const bannerSrc = locale === "en" ? "/offerltr.png" : "/offerrtl.png";

  const { deals, endsAt, viewAllHref } = useMemo(() => {
    if (isSkeleton) {
      return {
        deals: mockFlashDeals(locale).slice(0, DEAL_COUNT),
        endsAt: null as string | null,
        viewAllHref: "/search?sale=1",
      };
    }
    if (!products?.length) {
      return { deals: [], endsAt: null as string | null, viewAllHref: "/search?sale=1" };
    }

    const campaignDeals = products.filter((product) => product.campaign);
    const sourced = campaignDeals.length ? campaignDeals : sortFlashDealProducts(products);
    const nextDeals = sourced.slice(0, DEAL_COUNT);
    const nextEndsAt =
      nextDeals
        .map((product) => product.campaign?.ends_at)
        .filter((value): value is string => Boolean(value))
        .sort()[0] ?? null;
    const uniqueCampaigns = nextDeals
      .map((product) => product.campaign)
      .filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign))
      .filter((campaign, index, list) => list.findIndex((item) => item.id === campaign.id) === index);
    const nextHref =
      uniqueCampaigns.length === 1 ? campaignSearchPath(uniqueCampaigns[0]) : "/search?sale=1";
    return { deals: nextDeals, endsAt: nextEndsAt, viewAllHref: nextHref };
  }, [isSkeleton, locale, products]);

  return (
    <main dir={dir} className="py-6 md:py-10">
      <section className="relative overflow-hidden rounded-3xl border border-border-subtle bg-black">
        <div className="relative flex min-h-[240px] items-center sm:min-h-[300px] lg:min-h-[380px]">
          <div className="pointer-events-none absolute inset-0">
            <StorefrontImage
              key={bannerSrc}
              src={bannerSrc}
              alt=""
              fill
              priority
              sizes="100vw"
              withBlur={false}
              className={cn(
                "object-cover",
                locale === "en" ? "object-right" : "object-left",
              )}
            />
          </div>
          <div
            aria-hidden
            className={cn(
              "absolute inset-0",
              locale === "en"
                ? "bg-gradient-to-r from-black/80 via-black/45 to-transparent"
                : "bg-gradient-to-l from-black/80 via-black/45 to-transparent",
            )}
          />
          <div className="relative z-10 w-[min(100%,36rem)] px-5 py-8 sm:px-10 sm:py-12">
            <p className="inline-flex items-center gap-2 rounded-full border border-gold-hairline bg-bg-main/50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-gold">
              <AppIcon icon={Sparkles} size="xs" />
              {m.offers.activeDeals}
            </p>
            <h1
              className={cn(
                "mt-4 text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl",
                locale === "en" && "font-logo",
              )}
            >
              {m.offers.title}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-7 text-white/70 sm:text-base">
              {m.offers.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/search?sale=1">
                <Button size="lg">{m.offers.browseCta}</Button>
              </Link>
              <Link href="/categories">
                <Button variant="secondary" size="lg">
                  {t("home.shopByCategory")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PERKS.map((perk) => {
          const gold = perk.tone === "gold";
          return (
            <li key={perk.titleKey}>
              <Link
                href={perk.href}
                className="group flex h-full flex-col rounded-2xl border border-border-subtle bg-bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent-teal/40 hover:shadow-xl"
              >
                <span
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl",
                    gold
                      ? "bg-gold-wash-bg text-accent-gold"
                      : "bg-accent-teal/15 text-accent-teal",
                  )}
                >
                  <AppIcon icon={perk.icon} size="md" />
                </span>
                <h2 className="mt-4 text-base font-semibold text-text-primary">
                  {m.offers[perk.titleKey]}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-6 text-text-secondary">
                  {m.offers[perk.descKey]}
                </p>
                <span
                  className={cn(
                    "mt-4 text-sm font-medium transition-colors",
                    gold
                      ? "text-accent-gold group-hover:text-accent-gold"
                      : "text-accent-teal",
                  )}
                >
                  {m.offers.browseCta}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section className="mt-12">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
            <h2
              className={cn(
                "text-xl font-bold tracking-tight text-text-primary sm:text-2xl",
                locale === "en" && "font-logo",
              )}
            >
              {m.offers.activeDeals}
            </h2>
            <FlashDealTimer endsAt={endsAt} fallback={!isSkeleton && deals.length > 0} />
          </div>
          {deals.length > 0 ? (
            <Link href={viewAllHref} className="shrink-0 text-sm font-medium text-accent-gold">
              {t("home.viewAll")}
            </Link>
          ) : null}
        </div>

        {!isSkeleton && deals.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-subtle bg-bg-card px-4 py-16 text-center text-sm text-text-secondary">
            {m.offers.noOffers}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {deals.map((product, index) => (
              <ProductDealCard
                key={product.id}
                product={product}
                isSkeleton={isSkeleton}
                priority={index < 4}
                layout="grid"
              />
            ))}
          </div>
        )}
        <p className="mt-4 text-center text-xs text-text-secondary">{m.offers.termsApply}</p>
      </section>
    </main>
  );
}
