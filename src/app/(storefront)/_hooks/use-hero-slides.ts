"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockHeroSlides } from "@/app/(storefront)/_mocks/hero-slides-mock";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { getHeroBannersAction } from "@/app/_actions/banner-actions";
import { useTranslations } from "@/i18n/use-translations";

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

    const fromAdmin = (banners ?? []).map((banner) => ({
      id: banner.id,
      badge: banner.badge?.trim() || t("home.heroBadge"),
      title: banner.title?.trim() || t("home.heroTitle"),
      subtitle: banner.subtitle?.trim() || t("home.heroSubtitle"),
      ctaLabel: banner.cta_label?.trim() || t("home.heroCta"),
      ctaHref: banner.cta_href?.trim() || "/categories",
      imageUrl: banner.image_url?.trim() || null,
      blurHash: banner.blur_hash?.trim() || null,
    }));

    if (fromAdmin.length) return fromAdmin;
    return mockHeroSlides(locale).slice(0, 1);
  }, [banners, isSkeleton, locale, t]);

  return { slides, isSkeleton };
}
