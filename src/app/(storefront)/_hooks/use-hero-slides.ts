"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { mockHeroSlides } from "@/app/(storefront)/_mocks/hero-slides-mock";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { getHeroBannersAction } from "@/app/_actions/banner-actions";
import type { HeroBanner } from "@/app/_types/database.types";
import { getDirection, type Locale } from "@/i18n/config";
import { resolveHeroBannerText } from "@/lib/i18n/hero-banner-text";
import { useTranslations } from "@/i18n/use-translations";

function adminSlide(
  banner: HeroBanner,
  t: ReturnType<typeof useTranslations>["t"],
  locale: Locale,
  dir: "rtl" | "ltr",
): HeroSlide {
  const rtlImage = banner.image_url?.trim() || null;
  // English storefront gets its own artwork when provided (the text block
  // sits on the opposite side), otherwise it falls back to the main image.
  const imageUrl =
    dir === "ltr" ? banner.image_url_ltr?.trim() || rtlImage : rtlImage;
  const blurHash =
    dir === "ltr" && banner.image_url_ltr?.trim()
      ? banner.blur_hash_ltr?.trim() || banner.blur_hash?.trim() || null
      : banner.blur_hash?.trim() || null;
  const hasImage = Boolean(imageUrl);
  const badge = resolveHeroBannerText(banner, "badge", locale);
  const title = resolveHeroBannerText(banner, "title", locale);
  const subtitle = resolveHeroBannerText(banner, "subtitle", locale);

  return {
    id: banner.id,
    badge: badge || (!hasImage ? t("home.heroBadge") : ""),
    title: title || (!hasImage ? t("home.heroTitle") : ""),
    subtitle: subtitle || (!hasImage ? t("home.heroSubtitle") : ""),
    ctaLabel: resolveHeroBannerText(banner, "cta_label", locale) || t("home.heroCta"),
    ctaHref: banner.cta_href?.trim() || "/categories",
    imageUrl,
    blurHash,
    imageOnly: hasImage && !badge && !title && !subtitle,
  };
}

export function useHeroSlides() {
  const { t, locale } = useTranslations();
  const dir = getDirection(locale);
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
    return (banners ?? []).map((banner) => adminSlide(banner, t, locale, dir));
  }, [banners, isSkeleton, locale, dir, t]);

  return { slides, isSkeleton };
}
