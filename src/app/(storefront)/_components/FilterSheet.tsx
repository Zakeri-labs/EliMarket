"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import type { ShopRefine } from "@/app/(storefront)/_components/ShopSidebar";
import type { HomePill } from "@/lib/products/home-filters";

type SortKey = "newest" | "price-asc" | "price-desc";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pills: { id: HomePill; count: number }[];
  activePill: HomePill | null;
  onTogglePill: (id: HomePill) => void;
  sort: SortKey;
  onSort: (sort: SortKey) => void;
  refine: ShopRefine;
  onRefineChange: (next: ShopRefine) => void;
  refineCounts: { inStock: number; onCampaign: number; organic: number };
  resultCount: number;
  onReset: () => void;
};

function pillLabelKey(id: HomePill) {
  switch (id) {
    case "campaigns":
      return "home.pillCampaigns";
    case "newest":
      return "home.pillNewest";
    case "bestsellers":
      return "home.pillBestSellers";
    case "discounted":
      return "home.pillDiscounted";
    case "under1":
      return "home.pillUnderOne";
    case "local":
      return "home.pillLocal";
  }
}

function ToggleRow({
  label,
  count,
  checked,
  onChange,
}: {
  label: string;
  count: number;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-3 border-b border-border-subtle py-3 last:border-b-0">
      <span className="flex items-center gap-2 text-sm text-foreground">
        {label}
        <span className="text-xs text-muted">{count}</span>
      </span>
      <span className="relative inline-flex h-6 w-11 shrink-0 items-center">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="absolute inset-0 rounded-full bg-border-subtle transition-colors peer-checked:bg-accent-teal" />
        <span className="absolute start-0.5 h-5 w-5 rounded-full bg-white shadow transition-all peer-checked:start-[22px]" />
      </span>
    </label>
  );
}

export function FilterSheet({
  open,
  onOpenChange,
  pills,
  activePill,
  onTogglePill,
  sort,
  onSort,
  refine,
  onRefineChange,
  refineCounts,
  resultCount,
  onReset,
}: Props) {
  const { t, dir } = useTranslations();

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "newest", label: t("search.sortNewest") },
    { key: "price-asc", label: t("search.sortPriceAsc") },
    { key: "price-desc", label: t("search.sortPriceDesc") },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 bg-black/60"
          style={{ zIndex: 100000 }}
        />
        <Dialog.Content
          dir={dir}
          className="fixed inset-x-0 bottom-0 flex max-h-[85vh] flex-col rounded-t-2xl bg-surface"
          style={{ zIndex: 100001 }}
          aria-describedby={undefined}
        >
          <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-border-subtle" />

          <div className="flex shrink-0 items-center justify-between px-4 pb-3 pt-3">
            <Dialog.Title className="text-lg font-bold text-foreground">
              {t("home.filtersTitle")}
            </Dialog.Title>
            <button
              type="button"
              onClick={onReset}
              className="text-sm font-medium text-accent"
            >
              {t("home.resetAll")}
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4">
            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                {t("search.sortLabel")}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {sortOptions.map((option) => {
                  const selected = sort === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => onSort(option.key)}
                      className={cn(
                        "rounded-full border px-2 py-2 text-xs font-medium",
                        selected
                          ? "border-accent-teal bg-accent-teal text-bg-main"
                          : "border-border text-foreground",
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-5">
              <p className="mb-2 text-[11px] font-medium tracking-[0.16em] text-muted uppercase">
                {t("home.collectionsLabel")}
              </p>
              <div className="flex flex-wrap gap-2">
                {pills.map((pill) => {
                  const selected = activePill === pill.id;
                  return (
                    <button
                      key={pill.id}
                      type="button"
                      onClick={() => onTogglePill(pill.id)}
                      className={cn(
                        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs",
                        selected
                          ? "border-accent bg-accent/15 text-accent"
                          : "border-border text-foreground",
                      )}
                    >
                      {t(pillLabelKey(pill.id))} {pill.count}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mb-4">
              <ToggleRow
                label={t("home.inStockOnly")}
                count={refineCounts.inStock}
                checked={refine.inStock}
                onChange={(value) => onRefineChange({ ...refine, inStock: value })}
              />
              <ToggleRow
                label={t("home.onCampaign")}
                count={refineCounts.onCampaign}
                checked={refine.onCampaign}
                onChange={(value) => onRefineChange({ ...refine, onCampaign: value })}
              />
              <ToggleRow
                label={t("home.organic")}
                count={refineCounts.organic}
                checked={refine.organic}
                onChange={(value) => onRefineChange({ ...refine, organic: value })}
              />
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3 border-t border-border-subtle p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={onReset}
              className="rounded-lg border border-border px-5 py-3 text-sm font-medium text-foreground"
            >
              {t("home.clear")}
            </button>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex-1 rounded-lg bg-accent-teal py-3 text-sm font-semibold text-bg-main"
              >
                {t("home.showResults", { count: resultCount })}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
