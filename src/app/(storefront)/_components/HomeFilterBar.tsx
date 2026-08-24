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
};

export function HomeFilterBar({
  pills,
  active,
  onToggle,
  sort,
  onSort,
  onOpenFilters,
  filterCount = 0,
}: Props) {
  const { t } = useTranslations();

  return (
    <div className="flex items-center gap-3">
      {onOpenFilters ? (
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground"
        >
          <AppIcon icon={SlidersHorizontal} size="xs" />
          {t("home.filterLabel")}
          {filterCount > 0 ? (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
              {filterCount}
            </span>
          ) : null}
        </button>
      ) : (
        <span className="text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
          {t("home.filterLabel")}
        </span>
      )}
      <div className="no-scrollbar flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
        {pills.map((pill) => {
          const selected = active === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onToggle(pill.id)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs",
                selected
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-border text-foreground hover:border-accent/40",
              )}
            >
              {t(
                pill.id === "campaigns"
                  ? "home.pillCampaigns"
                  : pill.id === "newest"
                    ? "home.pillNewest"
                    : pill.id === "bestsellers"
                      ? "home.pillBestSellers"
                      : pill.id === "discounted"
                        ? "home.pillDiscounted"
                        : pill.id === "under1"
                          ? "home.pillUnderOne"
                          : "home.pillLocal",
              )}{" "}
              {pill.count}
              {selected ? <AppIcon icon={X} size="xs" /> : null}
            </button>
          );
        })}
      </div>
      <label className="hidden shrink-0 items-center gap-2 text-xs text-muted sm:flex">
        <span>{t("search.sortLabel")}</span>
        <select
          className="rounded-lg border border-border bg-surface px-2 py-1 text-xs text-foreground outline-none"
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
