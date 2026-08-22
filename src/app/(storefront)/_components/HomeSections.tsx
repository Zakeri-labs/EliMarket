"use client";

import { ChevronDown, MapPin } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontSearchBar } from "@/app/(storefront)/_components/StorefrontSearchBar";
import { useTranslations } from "@/i18n/use-translations";

type LocationBarProps = {
  className?: string;
  compact?: boolean;
};

export function LocationBar({ className, compact = false }: LocationBarProps) {
  const { t } = useTranslations();

  return (
    <button
      type="button"
      className={cn(
        "flex items-center border border-border bg-surface text-start",
        compact
          ? "h-11 max-w-[14rem] gap-2 rounded-2xl px-3 lg:h-10 lg:rounded-lg"
          : "w-full justify-between rounded-2xl px-4 py-3 text-sm",
        className,
      )}
    >
      <AppIcon icon={MapPin} size="sm" className="shrink-0 text-muted lg:text-accent" />
      <span className={cn("min-w-0 flex-1", compact ? "" : "px-2")}>
        <span className="block text-[10px] text-muted">{t("home.deliverTo")}</span>
        <span className="block truncate text-sm font-medium">{t("home.locationSample")}</span>
      </span>
      <AppIcon icon={ChevronDown} size="sm" className="shrink-0 text-muted" />
    </button>
  );
}

export function SearchBar() {
  return <StorefrontSearchBar showScan size="lg" />;
}
