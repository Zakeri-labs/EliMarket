"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/app/utils/cn";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { FlashDealTimer } from "@/app/(storefront)/_components/FlashDealTimer";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { Button } from "@/components/ui/Button";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useTranslations } from "@/i18n/use-translations";
import { campaignSearchPath } from "@/lib/campaigns/href";
import { sortFlashDealProducts } from "@/lib/products/pricing";

const DEAL_COUNT = 15;

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
    <main dir={dir} className="py-8 md:py-12">
      <section className="relative overflow-hidden rounded-2xl bg-black">
        <div className="relative flex min-h-[200px] items-center sm:min-h-[260px] lg:min-h-[300px]">
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
                ? "bg-gradient-to-r from-black/70 via-black/35 to-transparent"
                : "bg-gradient-to-l from-black/70 via-black/35 to-transparent",
            )}
          />
          <div className="relative z-10 max-w-lg px-5 py-8 sm:px-8 sm:py-10">
            <h1
              className={cn(
                "text-3xl font-semibold tracking-tight text-white sm:text-4xl",
                locale === "en" && "font-logo",
              )}
            >
              {m.offers.title}
            </h1>
            <p className="mt-2 max-w-sm text-sm leading-6 text-white/65">
              {m.offers.subtitle}
            </p>
            <Link href="/search?sale=1" className="mt-5 inline-block">
              <Button size="md">{m.offers.browseCta}</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-baseline justify-between gap-3">
          <div className="flex min-w-0 items-baseline gap-3">
            <h2
              className={cn(
                "text-lg font-semibold text-text-primary",
                locale === "en" && "font-logo",
              )}
            >
              {m.offers.activeDeals}
            </h2>
            <FlashDealTimer endsAt={endsAt} fallback={!isSkeleton && deals.length > 0} />
          </div>
          {deals.length > 0 ? (
            <Link href={viewAllHref} className="shrink-0 text-sm text-text-secondary hover:text-text-primary">
              {t("home.viewAll")}
            </Link>
          ) : null}
        </div>

        {!isSkeleton && deals.length === 0 ? (
          <p className="py-16 text-center text-sm text-text-secondary">{m.offers.noOffers}</p>
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
        <p className="mt-6 text-center text-xs text-text-faint">{m.offers.termsApply}</p>
      </section>
    </main>
  );
}
