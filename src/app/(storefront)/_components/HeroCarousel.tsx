"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHeroSlides } from "@/app/(storefront)/_hooks/use-hero-slides";
import type { HeroSlide } from "@/app/(storefront)/_types/hero-slide";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { heroDefaultImage } from "@/lib/images/blur-placeholders";
import type { Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import styles from "./HeroCarousel.module.css";

const AUTO_INTERVAL_MS = 5000;

function resolveHeroFrameHeight(viewportWidth: number): number {
  if (viewportWidth >= 1280) return 360;
  if (viewportWidth >= 1024) return 340;
  if (viewportWidth >= 768) return 320;
  if (viewportWidth >= 640) return 300;
  return 280;
}

function useHeroFrameHeight(): number {
  const [height, setHeight] = useState(280);

  useEffect(() => {
    const update = () => setHeight(resolveHeroFrameHeight(window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return height;
}

function HeroSlidePanel({
  slide,
  isSkeleton,
  frameHeight,
  dir,
  locale,
}: {
  slide: HeroSlide;
  isSkeleton: boolean;
  frameHeight: number;
  dir: "rtl" | "ltr";
  locale: Locale;
}) {
  const imageSrc = slide.imageUrl ?? null;
  const hasImage = Boolean(imageSrc);

  return (
    <article
      className={cn(
        styles.slide,
        !hasImage &&
          "bg-gradient-to-l from-accent-dark via-accent/90 to-accent-dark/80 text-white rtl:bg-gradient-to-l ltr:bg-gradient-to-r",
        hasImage && "text-white",
        isSkeleton && "skeleton",
      )}
      aria-busy={isSkeleton}
      style={{ minHeight: frameHeight, height: frameHeight }}
    >
      {isSkeleton ? (
        <div className={styles.mediaLayer}>
          <SkeletonImage className="p-10 sm:p-16" />
        </div>
      ) : hasImage && imageSrc ? (
        <div className={styles.mediaLayer}>
          <StorefrontImage
            src={imageSrc}
            blurHash={slide.blurHash}
            alt=""
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            withBlur
            className="object-cover object-center md:object-[center_35%]"
          />
        </div>
      ) : (
        <div className={cn(styles.mediaLayer, "pointer-events-none opacity-30")}>
          <StorefrontImage
            src={heroDefaultImage}
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            withBlur={false}
            className="object-cover object-center"
          />
        </div>
      )}

      <div
        className={styles.content}
        dir={dir}
        style={{ minHeight: frameHeight }}
      >
        <p className="w-full text-start text-xs font-medium uppercase tracking-wide opacity-90">
          {slide.badge}
        </p>
        <h2
          className={cn(
            "mt-1 w-full max-w-lg text-start text-2xl leading-tight sm:text-3xl md:text-4xl",
            locale === "en" ? "font-logo font-semibold" : "font-bold",
          )}
        >
          {slide.title}
        </h2>
        <p className="mt-2 w-full max-w-md text-start text-sm opacity-90 sm:text-base">
          {slide.subtitle}
        </p>
        <Link
          href={isSkeleton ? "#" : slide.ctaHref}
          className="mt-4 inline-flex shrink-0 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90"
          onClick={(e) => {
            if (isSkeleton) e.preventDefault();
          }}
        >
          {slide.ctaLabel}
        </Link>
      </div>
    </article>
  );
}

export function HeroCarousel() {
  const { slides, isSkeleton } = useHeroSlides();
  const { t, dir, locale } = useTranslations();
  const frameHeight = useHeroFrameHeight();
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

  const showControls = slides.length > 1;

  return (
    <section
      className="relative w-full"
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
      <div
        className={styles.frame}
        data-hero-carousel-frame
        style={{ height: frameHeight, minHeight: frameHeight }}
      >
        <div className={styles.viewport} dir="ltr" style={{ minHeight: frameHeight }}>
          <div
            className={styles.track}
            style={{ transform: `translateX(-${index * 100}%)`, minHeight: frameHeight }}
          >
            {slides.map((slide) => (
              <HeroSlidePanel
                key={slide.id}
                slide={slide}
                isSkeleton={isSkeleton}
                frameHeight={frameHeight}
                dir={dir}
                locale={locale}
              />
            ))}
          </div>
        </div>

        {showControls && (
          <>
            <button
              type="button"
              className="absolute start-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-colors hover:bg-black/45 hover:backdrop-blur-sm disabled:opacity-40"
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
              className="absolute end-3 top-1/2 z-30 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white transition-colors hover:bg-black/45 hover:backdrop-blur-sm disabled:opacity-40"
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
          </>
        )}
      </div>

      {showControls && (
        <div
          className={styles.dots}
          role="tablist"
          aria-label={t("home.heroCarouselLabel")}
        >
          {slides.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={t("home.heroGoToSlide", { n: i + 1 })}
              className={styles.dotButton}
              onClick={() => goTo(i)}
            >
              <span
                className={cn(styles.dot, i === index && styles.dotActive)}
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
