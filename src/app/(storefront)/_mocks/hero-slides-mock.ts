import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import type { Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function mockHeroSlides(locale: Locale): HeroSlide[] {
  const h = getMessages(locale).home;
  return [
    {
      id: "mock-1",
      badge: h.heroBadge,
      title: h.heroTitle,
      subtitle: h.heroSubtitle,
      ctaLabel: h.heroCta,
      ctaHref: "/categories",
      imageUrl: "/icon.png",
    },
    {
      id: "mock-2",
      badge: h.heroSlide2Badge,
      title: h.heroSlide2Title,
      subtitle: h.heroSlide2Subtitle,
      ctaLabel: h.heroCta,
      ctaHref: "/categories",
    },
    {
      id: "mock-3",
      badge: h.heroSlide3Badge,
      title: h.heroSlide3Title,
      subtitle: h.heroSlide3Subtitle,
      ctaLabel: h.heroCta,
      ctaHref: "/search",
    },
  ];
}
