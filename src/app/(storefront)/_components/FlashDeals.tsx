"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { FlashDealTimer } from "@/app/(storefront)/_components/FlashDealTimer";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { mockFlashDeals } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { campaignSearchPath } from "@/lib/campaigns/href";
import { sortFlashDealProducts } from "@/lib/products/pricing";

const HOME_DEAL_COUNT = 10;

type Props = {
  limit?: number;
};

export function FlashDeals({ limit }: Props) {
  const { data: products, isPending } = useProducts();
  const { t, dir, locale } = useTranslations();
  const isSkeleton = isPending;
  const dealCount = limit ?? HOME_DEAL_COUNT;

  const { deals, endsAt, viewAllHref } = useMemo(() => {
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

  if (!isSkeleton && deals.length === 0) return null;

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <h2 className="text-start font-logo text-base tracking-wide sm:text-lg">
            {t("home.flashDeals")}
          </h2>
          <FlashDealTimer endsAt={endsAt} />
        </div>
        <Link
          href={viewAllHref}
          className="shrink-0 text-sm font-medium text-accent-gold"
        >
          {t("home.viewAll")}
        </Link>
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
