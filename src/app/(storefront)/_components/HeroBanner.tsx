"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/app/(storefront)/_hooks/use-hero-slides";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { StripePlaceholder } from "@/components/ui/StripePlaceholder";
import { useTranslations } from "@/i18n/use-translations";

const AUTO_INTERVAL_MS = 6000;

export function HeroBanner() {
  const { slides, isSkeleton } = useHeroSlides();
  const { t, dir, locale } = useTranslations();
  const isRtl = dir === "rtl";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number) => {
      if (slides.length === 0) return;
      setIndex(((next % slides.length) + slides.length) % slides.length);
    },
    [slides.length],
  );

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (paused || isSkeleton || slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [paused, isSkeleton, slides.length]);

  if (slides.length === 0) return null;

  const slide = slides[index];
  const showControls = slides.length > 1;

  return (
    <section
      className="relative h-[340px] overflow-hidden rounded-2xl border border-border-subtle"
      aria-roledescription="carousel"
      aria-label={t("home.heroCarouselLabel")}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      {!isSkeleton && slide?.imageUrl ? (
        <div className="absolute inset-0">
          <StorefrontImage
            key={slide.id}
            src={slide.imageUrl}
            blurHash={slide.blurHash}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            withBlur
            className="object-cover object-center"
          />
        </div>
      ) : (
        <StripePlaceholder className="absolute inset-0" label="produce basket photo" />
      )}

      {/* Two stacked gradients: bottom-to-top for edge legibility, plus a stronger
          scrim behind the text block on the language's reading-start side. */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div
        className={cn(
          "absolute inset-0",
          isRtl
            ? "bg-gradient-to-l from-black/85 via-black/50 to-transparent"
            : "bg-gradient-to-r from-black/85 via-black/50 to-transparent",
        )}
      />

      <div
        className="relative z-10 flex h-full flex-col justify-center px-10"
        dir={dir}
      >
        <p className="mb-4 w-full max-w-md text-start text-xs font-medium tracking-[0.15em] text-accent-gold uppercase drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
          {slide.badge}
        </p>
        <h2
          className={cn(
            "mb-5 w-full max-w-md text-start font-logo text-[42px] leading-[1.15] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.55)]",
            locale === "en" ? "font-semibold" : "font-bold",
          )}
        >
          {slide.title}
        </h2>
        <p className="mb-7 w-full max-w-md text-start text-base text-white/90 drop-shadow-[0_1px_4px_rgba(0,0,0,0.6)]">
          {slide.subtitle}
        </p>
        <div className="flex w-full">
          <Link
            href={isSkeleton ? "#" : slide.ctaHref}
            className="rounded-lg bg-accent-teal px-6 py-3 text-sm font-semibold text-bg-main"
            onClick={(e) => {
              if (isSkeleton) e.preventDefault();
            }}
          >
            {slide.ctaLabel}
          </Link>
        </div>
      </div>

      {showControls && (
        <>
          <button
            type="button"
            className="absolute start-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-colors hover:bg-black/45 hover:backdrop-blur-sm disabled:opacity-40"
            aria-label={t("home.heroPrev")}
            disabled={isSkeleton}
            onClick={() => goTo(index - 1)}
          >
            <AppIcon
              icon={ChevronLeft}
              size="md"
              className="rtl:rotate-180 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            />
          </button>
          <button
            type="button"
            className="absolute end-4 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-colors hover:bg-black/45 hover:backdrop-blur-sm disabled:opacity-40"
            aria-label={t("home.heroNext")}
            disabled={isSkeleton}
            onClick={() => goTo(index + 1)}
          >
            <AppIcon
              icon={ChevronRight}
              size="md"
              className="rtl:rotate-180 drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]"
            />
          </button>
          <div
            className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2"
            role="tablist"
            aria-label={t("home.heroCarouselLabel")}
          >
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={t("home.heroGoToSlide", { n: i + 1 })}
                className="flex h-8 w-8 items-center justify-center rounded-full"
                onClick={() => goTo(i)}
              >
                <span
                  className={cn(
                    "block h-2 w-2 rounded-full bg-white/45 transition-all",
                    i === index && "w-6 bg-white",
                  )}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
