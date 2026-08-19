"use client";

import { useMemo } from "react";
import { mockHeroSlides } from "@/app/(storefront)/_mocks/hero-slides-mock";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useTranslations } from "@/i18n/use-translations";

export function useHeroSlides() {
  const { t, locale } = useTranslations();
  const { hero, isPending: settingsPending } = useStoreSettings();
  const isSkeleton = settingsPending;

  const slides = useMemo((): HeroSlide[] => {
    if (isSkeleton) return mockHeroSlides(locale);

    const adminSlide: HeroSlide = {
      id: "admin",
      badge: hero.hero_badge?.trim() || t("home.heroBadge"),
      title: hero.hero_title?.trim() || t("home.heroTitle"),
      subtitle: hero.hero_subtitle?.trim() || t("home.heroSubtitle"),
      ctaLabel: hero.hero_cta_label?.trim() || t("home.heroCta"),
      ctaHref: hero.hero_cta_href?.trim() || "/categories",
      imageUrl: hero.hero_image_url?.trim() || null,
      blurHash: hero.hero_blur_hash?.trim() || null,
    };

    const extras: HeroSlide[] = [
      {
        id: "promo-2",
        badge: t("home.heroSlide2Badge"),
        title: t("home.heroSlide2Title"),
        subtitle: t("home.heroSlide2Subtitle"),
        ctaLabel: t("home.heroCta"),
        ctaHref: "/categories",
      },
      {
        id: "promo-3",
        badge: t("home.heroSlide3Badge"),
        title: t("home.heroSlide3Title"),
        subtitle: t("home.heroSlide3Subtitle"),
        ctaLabel: t("home.heroCta"),
        ctaHref: "/search",
      },
    ];

    return [adminSlide, ...extras];
  }, [hero, isSkeleton, locale, t]);

  return { slides, isSkeleton };
}
