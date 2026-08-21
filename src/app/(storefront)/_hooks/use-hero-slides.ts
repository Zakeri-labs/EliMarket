"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockHeroSlides } from "@/app/(storefront)/_mocks/hero-slides-mock";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { getHeroBannersAction } from "@/app/_actions/banner-actions";
import { campaignSearchPath } from "@/lib/campaigns/href";
import { useTranslations } from "@/i18n/use-translations";
import type { CampaignBanner } from "@/lib/campaigns/load";

function campaignSlide(
  campaign: CampaignBanner,
  t: ReturnType<typeof useTranslations>["t"],
): HeroSlide {
  const subtitle =
    campaign.type === "percent"
      ? t("home.campaignPercentOff", { value: campaign.discount_value })
      : t("home.campaignFixedOff", { value: campaign.discount_value });

  return {
    id: `campaign-${campaign.id}`,
    badge: campaign.badge?.trim() || t("home.heroSlide2Badge"),
    title: campaign.name,
    subtitle,
    ctaLabel: t("home.heroCta"),
    ctaHref: campaignSearchPath(campaign),
    imageUrl: campaign.banner_image_url?.trim() || null,
    blurHash: campaign.banner_blur_hash?.trim() || null,
  };
}

export function useHeroSlides() {
  const { t, locale } = useTranslations();
  const { data, isPending } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const result = await getHeroBannersAction();
      if (!result.success) throw new Error(result.error);
      return { banners: result.data, campaigns: result.campaigns };
    },
    staleTime: 15_000,
  });

  const isSkeleton = isPending;

  const slides = useMemo((): HeroSlide[] => {
    if (isSkeleton) return mockHeroSlides(locale);

    const fromCampaigns = (data?.campaigns ?? []).map((campaign) => campaignSlide(campaign, t));
    const fromAdmin = (data?.banners ?? []).map((banner) => ({
      id: banner.id,
      badge: banner.badge?.trim() || t("home.heroBadge"),
      title: banner.title?.trim() || t("home.heroTitle"),
      subtitle: banner.subtitle?.trim() || t("home.heroSubtitle"),
      ctaLabel: banner.cta_label?.trim() || t("home.heroCta"),
      ctaHref: banner.cta_href?.trim() || "/categories",
      imageUrl: banner.image_url?.trim() || null,
      blurHash: banner.blur_hash?.trim() || null,
    }));

    const merged = [...fromCampaigns, ...fromAdmin];
    if (merged.length) return merged;
    return mockHeroSlides(locale).slice(0, 1);
  }, [data, isSkeleton, locale, t]);

  return { slides, isSkeleton };
}
