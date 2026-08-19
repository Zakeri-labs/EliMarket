"use client";

import Link from "next/link";
import { ChevronDown, MapPin, Search, ShoppingBasket } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function LocationBar() {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
    >
      <AppIcon icon={MapPin} size="sm" className="text-muted" />
      <span className="flex-1 px-2 text-start">
        <span className="block text-[10px] text-muted">{t("home.deliverTo")}</span>
        <span className="font-medium">{t("home.locationSample")}</span>
      </span>
      <AppIcon icon={ChevronDown} size="sm" className="text-muted" />
    </button>
  );
}

export function SearchBar() {
  const { t } = useTranslations();

  return (
    <Link
      href="/search"
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3"
    >
      <AppIcon icon={Search} size="sm" className="text-muted" />
      <span className="flex-1 text-sm text-muted">{t("home.searchPlaceholder")}</span>
    </Link>
  );
}

export function HeroBanner() {
  const { t } = useTranslations();

  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-accent-dark to-accent p-5 text-black rtl:bg-gradient-to-l ltr:bg-gradient-to-r">
      <div className="relative z-10 max-w-[60%]">
        <p className="text-xs font-medium opacity-80">{t("home.heroBadge")}</p>
        <h2 className="mt-1 text-lg font-bold leading-snug">{t("home.heroTitle")}</h2>
        <p className="mt-1 text-xs opacity-80">{t("home.heroSubtitle")}</p>
        <Link
          href="/categories"
          className="mt-3 inline-block rounded-xl bg-black/20 px-4 py-2 text-xs font-semibold backdrop-blur-sm"
        >
          {t("home.heroCta")}
        </Link>
      </div>
      <AppIcon
        icon={ShoppingBasket}
        size="2xl"
        className="absolute -start-4 bottom-0 opacity-40"
      />
    </section>
  );
}
