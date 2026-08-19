"use client";

import Link from "next/link";
import { ChevronDown, MapPin, ScanLine, Search } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function LocationBar() {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      className="flex w-full items-center justify-between rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
    >
      <AppIcon icon={MapPin} size="sm" className="shrink-0 text-muted" />
      <span className="min-w-0 flex-1 px-2 text-start">
        <span className="block text-[10px] text-muted">{t("home.deliverTo")}</span>
        <span className="block truncate font-medium">{t("home.locationSample")}</span>
      </span>
      <AppIcon icon={ChevronDown} size="sm" className="shrink-0 text-muted" />
    </button>
  );
}

export function SearchBar() {
  const { t } = useTranslations();

  return (
    <div className="flex gap-2">
      <Link
        href="/search"
        className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-border bg-surface-elevated px-4 py-3"
      >
        <AppIcon icon={Search} size="sm" className="shrink-0 text-muted" />
        <span className="truncate text-sm text-muted">{t("home.searchPlaceholder")}</span>
      </Link>
      <Link
        href="/search"
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-surface-elevated text-muted hover:text-foreground"
        aria-label={t("home.searchPlaceholder")}
      >
        <AppIcon icon={ScanLine} size="sm" />
      </Link>
    </div>
  );
}
