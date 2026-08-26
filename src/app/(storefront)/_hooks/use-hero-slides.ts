"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockHeroSlides } from "@/app/(storefront)/_mocks/hero-slides-mock";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { getHeroBannersAction } from "@/app/_actions/banner-actions";
import type { HeroBanner } from "@/app/_types/database.types";
import { useTranslations } from "@/i18n/use-translations";

function adminSlide(
  banner: HeroBanner,
  t: ReturnType<typeof useTranslations>["t"],
): HeroSlide {
  const hasImage = Boolean(banner.image_url?.trim());
  const badge = banner.badge?.trim() ?? "";
  const title = banner.title?.trim() ?? "";
  const subtitle = banner.subtitle?.trim() ?? "";

  return {
    id: banner.id,
    badge: badge || (!hasImage ? t("home.heroBadge") : ""),
    title: title || (!hasImage ? t("home.heroTitle") : ""),
    subtitle: subtitle || (!hasImage ? t("home.heroSubtitle") : ""),
    ctaLabel: banner.cta_label?.trim() || t("home.heroCta"),
    ctaHref: banner.cta_href?.trim() || "/categories",
    imageUrl: banner.image_url?.trim() || null,
    blurHash: banner.blur_hash?.trim() || null,
    imageOnly: hasImage && !badge && !title && !subtitle,
  };
}

export function useHeroSlides() {
  const { t, locale } = useTranslations();
  const { data: banners, isPending } = useQuery({
    queryKey: ["hero-banners"],
    queryFn: async () => {
      const result = await getHeroBannersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 15_000,
  });

  const isSkeleton = isPending;

  const slides = useMemo((): HeroSlide[] => {
    if (isSkeleton) return mockHeroSlides(locale);
    return (banners ?? []).map((banner) => adminSlide(banner, t));
  }, [banners, isSkeleton, locale, t]);

  return { slides, isSkeleton };
}
