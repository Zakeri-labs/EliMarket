"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useMemo } from "react";
import { cn } from "@/app/utils/cn";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { campaignSearchPath } from "@/lib/campaigns/href";
import { sortFlashDealProducts } from "@/lib/products/pricing";

const HOME_DEAL_COUNT = 10;

type Props = {
  limit?: number;
  hideViewAll?: boolean;
};

export function FlashDeals({ limit, hideViewAll = false }: Props) {
  const { data: products, isPending } = useProducts();
  const { t, dir, locale } = useTranslations();
  const isSkeleton = isPending;
  const dealCount = limit ?? HOME_DEAL_COUNT;

  const { deals, viewAllHref } = useMemo(() => {
    if (isSkeleton) {
      return {
        deals: mockFlashDeals(locale).slice(0, dealCount),
        endsAt: null as string | null,
        viewAllHref: "/search?sale=1",
      };
    }
    if (!products?.length) {
      return { deals: [], endsAt: null as string | null, viewAllHref: "/search?sale=1" };
    }

    const campaignDeals = products.filter((product) => product.campaign);
    const homeDeals = campaignDeals.filter((product) => product.campaign?.show_on_home);
    const sourced = homeDeals.length
      ? homeDeals
      : campaignDeals.length
        ? campaignDeals
        : sortFlashDealProducts(products);
    const nextDeals = sourced.slice(0, dealCount);
    const nextEndsAt =
      nextDeals
        .map((product) => product.campaign?.ends_at)
        .filter((value): value is string => Boolean(value))
        .sort()[0] ?? null;
    const uniqueCampaigns = nextDeals
      .map((product) => product.campaign)
      .filter((campaign): campaign is NonNullable<typeof campaign> => Boolean(campaign))
      .filter((campaign, index, list) => list.findIndex((item) => item.id === campaign.id) === index);
    const viewAllHref =
      uniqueCampaigns.length === 1 ? campaignSearchPath(uniqueCampaigns[0]) : "/search?sale=1";
    return { deals: nextDeals, endsAt: nextEndsAt, viewAllHref };
  }, [dealCount, isSkeleton, locale, products]);

  if (!isSkeleton && deals.length === 0) {
    return (
      <section dir={dir} className="invisible pointer-events-none" aria-hidden>
        <div className="mb-4 flex h-7 items-center justify-between gap-2">
          <div className="h-6 w-28 rounded bg-transparent" />
          <div className="h-5 w-16 rounded bg-transparent" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {Array.from({ length: Math.min(dealCount, 5) }, (_, i) => (
            <div key={i}>
              <div className="aspect-square w-full" />
              <div className="mt-2 min-h-8" />
              <div className="mt-1.5 min-h-8" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section dir={dir}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2">
          <h2
            className={cn(
              "text-start text-2xl font-semibold tracking-wide sm:text-[32px]",
              locale === "en" && "font-logo",
            )}
          >
            {t("home.flashDeals")}
          </h2>
          <span aria-hidden className="hidden h-px w-24 bg-border-subtle sm:block" />
        </div>
        {hideViewAll ? null : (
          <Link
            href={viewAllHref}
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent-gold"
          >
            {t("home.viewAll")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {deals.map((product, index) => (
          <ProductDealCard
            key={product.id}
            product={product}
            isSkeleton={isSkeleton}
            priority={index < 2}
            layout="grid"
          />
        ))}
      </div>
    </section>
  );
}
