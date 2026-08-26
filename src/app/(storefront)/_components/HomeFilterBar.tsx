"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";
import type { HomePill } from "@/lib/products/home-filters";

type SortKey = "newest" | "price-asc" | "price-desc";

type Props = {
  pills: { id: HomePill; count: number }[];
  active: HomePill | null;
  onToggle: (id: HomePill) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  /** Mobile: renders the label as a button that opens the full filter sheet. */
  onOpenFilters?: () => void;
  /** Badge count shown on the filters button (e.g. active refine toggles). */
  filterCount?: number;
  isSkeleton?: boolean;
};

function pillLabelKey(id: HomePill) {
  switch (id) {
    case "campaigns":
      return "home.pillCampaigns" as const;
    case "newest":
      return "home.pillNewest" as const;
    case "bestsellers":
      return "home.pillBestSellers" as const;
    case "discounted":
      return "home.pillDiscounted" as const;
    case "under1":
      return "home.pillUnderOne" as const;
    case "local":
      return "home.pillLocal" as const;
  }
}

/** Fixed-height filter row — badge/X/count never change layout width. */
export function HomeFilterBar({
  pills,
  active,
  onToggle,
  sort,
  onSort,
  onOpenFilters,
  filterCount = 0,
  isSkeleton = false,
}: Props) {
  const { t } = useTranslations();

  return (
    <div className={cn("flex h-9 items-center gap-3", isSkeleton && "skeleton")}>
      {onOpenFilters ? (
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-border px-3 text-xs font-medium text-foreground"
        >
          <AppIcon icon={SlidersHorizontal} size="xs" />
          {t("home.filterLabel")}
          <span
            className={cn(
              "flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground tabular-nums",
              filterCount <= 0 && "invisible",
            )}
            aria-hidden={filterCount <= 0}
          >
            {filterCount > 0 ? filterCount : 0}
          </span>
        </button>
      ) : (
        <span className="shrink-0 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          {t("home.filterLabel")}
        </span>
      )}
      <div className="no-scrollbar flex h-8 min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {pills.map((pill) => {
          const selected = active === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onToggle(pill.id)}
              className={cn(
                "inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs",
                selected
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border text-foreground hover:border-accent/40",
              )}
            >
              <span>{t(pillLabelKey(pill.id))}</span>
              <span className="min-w-[1.5rem] text-end tabular-nums">{pill.count}</span>
              <AppIcon
                icon={X}
                size="xs"
                className={cn(!selected && "invisible")}
                aria-hidden={!selected}
              />
            </button>
          );
        })}
      </div>
      <label className="hidden h-8 shrink-0 items-center gap-2 text-xs text-muted sm:flex">
        <span className="whitespace-nowrap">{t("search.sortLabel")}</span>
        <select
          className="h-8 rounded-lg border border-border bg-surface px-2 text-xs text-foreground outline-none"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortKey)}
        >
          <option value="newest">{t("search.sortNewest")}</option>
          <option value="price-asc">{t("search.sortPriceAsc")}</option>
          <option value="price-desc">{t("search.sortPriceDesc")}</option>
        </select>
      </label>
    </div>
  );
}
