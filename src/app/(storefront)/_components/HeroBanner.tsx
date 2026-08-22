"use client";

import Link from "next/link";
import { useHeroSlides } from "@/app/(storefront)/_hooks/use-hero-slides";
import { cn } from "@/app/utils/cn";
import { StripePlaceholder } from "@/components/ui/StripePlaceholder";
import { useTranslations } from "@/i18n/use-translations";

export function HeroBanner() {
  const { slides, isSkeleton } = useHeroSlides();
  const { t, locale } = useTranslations();
  const slide = slides[0];
  const subtitle = t("home.heroDesktopSubtitle", { highlight: "%%HL%%" });
  const [before, after] = subtitle.split("%%HL%%");

  return (
    <section className="grid h-[340px] grid-cols-2 gap-6">
      <div className="flex flex-col justify-center rounded-2xl border border-border-subtle bg-bg-main p-10">
        <p className="mb-4 text-xs tracking-[0.15em] text-accent-gold uppercase">
          {t("home.heroFreshThisWeek")}
        </p>
        <h2
          className={cn(
            "mb-5 max-w-md font-logo text-[42px] leading-[1.15] text-text-primary",
            locale === "en" ? "font-semibold" : "font-bold",
          )}
        >
          {locale === "en" ? (
            <>
              Fresh essentials,
              <br />
              delivered to you
            </>
          ) : (
            t("home.heroDesktopTitle")
          )}
        </h2>
        <p className="mb-7 text-base text-text-secondary">
          {before}
          <span className="font-bold text-accent-teal">30%</span>
          {after}
        </p>
        <div className="flex gap-3">
          <Link
            href={isSkeleton ? "#" : (slide?.ctaHref || "/categories")}
            className="rounded-lg bg-accent-teal px-6 py-3 text-sm font-semibold text-bg-main"
          >
            {t("home.heroCta")}
          </Link>
          <Link
            href="/search?sale=1"
            className="rounded-lg border border-text-primary px-6 py-3 text-sm font-medium text-text-primary"
          >
            {t("home.browseDeals")}
          </Link>
        </div>
      </div>
      <div className="relative overflow-hidden rounded-2xl border border-border-subtle">
        {!isSkeleton && slide?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- fills a fixed hero panel, not a content image
          <img
            src={slide.imageUrl}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <StripePlaceholder className="absolute inset-0" label="produce basket photo" />
        )}
      </div>
    </section>
  );
}
