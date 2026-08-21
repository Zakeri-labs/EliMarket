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

export function FlashDeals() {
  const { data: products, isPending } = useProducts();
  const { t, dir, locale } = useTranslations();
  const isSkeleton = isPending;

  const { deals, endsAt, viewAllHref } = useMemo(() => {
    if (isSkeleton) {
      return { deals: mockFlashDeals(locale), endsAt: null as string | null, viewAllHref: "/search?sale=1" };
    }
    if (!products?.length) {
      return { deals: [], endsAt: null as string | null, viewAllHref: "/search?sale=1" };
    }

    const campaignDeals = products.filter((product) => product.campaign);
    const homeDeals = campaignDeals.filter((product) => product.campaign?.show_on_home);
    const sourced = homeDeals.length ? homeDeals : campaignDeals.length ? campaignDeals : sortFlashDealProducts(products);
    const nextDeals = sourced.slice(0, 6);
    const nextEndsAt = nextDeals
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
  }, [isSkeleton, locale, products]);

  if (!isSkeleton && deals.length === 0) return null;

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-start text-base font-bold sm:text-lg">{t("home.flashDeals")}</h2>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <FlashDealTimer endsAt={endsAt} />
          <Link href={viewAllHref} className="text-sm font-medium text-accent">
            {t("home.viewAll")}
          </Link>
        </div>
      </div>
      <div className="no-scrollbar -mx-4 flex items-stretch justify-start gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {deals.map((product, index) => (
          <ProductDealCard
            key={product.id}
            product={product}
            isSkeleton={isSkeleton}
            priority={index < 2}
          />
        ))}
      </div>
    </section>
  );
}
