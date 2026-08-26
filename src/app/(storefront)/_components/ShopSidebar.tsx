"use client";

import { useMemo, useState } from "react";
import type { Category, Product } from "@/app/_types/database.types";
import { CategoryListItem } from "@/app/(storefront)/_components/CategoryListItem";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import {
  childCategories,
  topLevelCategories,
} from "@/lib/categories/tree";
import { resolveCategoryName } from "@/lib/i18n/category-name";
import { isOrganicProduct } from "@/lib/products/home-filters";

export type ShopRefine = {
  inStock: boolean;
  onCampaign: boolean;
  organic: boolean;
};

const SIDEBAR_SLUGS = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "beverages",
  "snacks",
  "pantry",
  "personal-care",
  "household",
  "baby-care",
] as const;

type Props = {
  categories: Category[];
  products: Product[];
  refine: ShopRefine;
  onRefineChange: (next: ShopRefine) => void;
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  isSkeleton?: boolean;
};

export function ShopSidebar({
  categories,
  products,
  refine,
  onRefineChange,
  selectedCategoryId,
  onSelectCategory,
  isSkeleton = false,
}: Props) {
  const { t, locale } = useTranslations();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());

  const items = useMemo(() => {
    const ranked = topLevelCategories(categories).sort((a, b) => {
      const ai = SIDEBAR_SLUGS.indexOf(a.slug as (typeof SIDEBAR_SLUGS)[number]);
      const bi = SIDEBAR_SLUGS.indexOf(b.slug as (typeof SIDEBAR_SLUGS)[number]);
      const aRank = ai === -1 ? 999 : ai;
      const bRank = bi === -1 ? 999 : bi;
      if (aRank !== bRank) return aRank - bRank;
      return a.sort_order - b.sort_order || a.name.localeCompare(b.name);
    });
    return ranked.slice(0, 12);
  }, [categories]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Category[]>();
    for (const parent of items) {
      const kids = childCategories(categories, parent.id).sort(
        (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name),
      );
      if (kids.length) map.set(parent.id, kids);
    }
    return map;
  }, [categories, items]);

  const inStockCount = products.filter((p) => p.stock > 0).length;
  const campaignCount = products.filter((p) => p.campaign).length;
  const organicCount = products.filter(isOrganicProduct).length;

  function toggleExpand(id: string) {
    setExpandedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function selectCategory(id: string) {
    const nextId = selectedCategoryId === id ? null : id;
    onSelectCategory(nextId);
    if (nextId && childrenByParent.has(nextId)) {
      setExpandedIds((current) => new Set(current).add(nextId));
    }
    if (typeof document !== "undefined") {
      requestAnimationFrame(() => {
        document.getElementById("home-product-grid")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }

  return (
    <aside className="w-[260px] shrink-0 grow-0 basis-[260px] self-stretch">
      <div className={cn("flex w-[260px] flex-col", isSkeleton && "skeleton")}>
        <p className="mb-4 min-h-4 text-[11px] tracking-[0.1em] text-text-secondary uppercase">
          {t("home.shopByCategory")}
        </p>

        <nav className="flex w-full flex-col gap-1" aria-label={t("home.shopByCategory")}>
          {items.map((cat) => {
            const children = childrenByParent.get(cat.id) ?? [];
            const hasChildren = children.length > 0;
            const expanded = expandedIds.has(cat.id);

            return (
              <div key={cat.id} className="flex w-full flex-col">
                <CategoryListItem
                  category={cat}
                  label={resolveCategoryName(cat, locale)}
                  active={selectedCategoryId === cat.id}
                  hasChildren={hasChildren}
                  expanded={expanded}
                  onSelect={() => selectCategory(cat.id)}
                  onToggleExpand={() => toggleExpand(cat.id)}
                />
                {hasChildren && expanded ? (
                  <div className="mt-0.5 flex flex-col gap-0.5 border-s border-border-subtle ms-3.5">
                    {children.map((child) => (
                      <CategoryListItem
                        key={child.id}
                        category={child}
                        label={resolveCategoryName(child, locale)}
                        active={selectedCategoryId === child.id}
                        depth={1}
                        onSelect={() => selectCategory(child.id)}
                      />
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>

        <div className="mt-6 w-full border-t border-border-subtle pt-6">
          <p className="mb-4 text-[11px] tracking-[0.1em] text-text-secondary uppercase">
            {t("home.refine")}
          </p>

          <div className="flex w-full flex-col">
            <label className="flex h-9 w-full items-center justify-between gap-2 text-sm text-text-primary">
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={refine.inStock}
                  onChange={(e) => onRefineChange({ ...refine, inStock: e.target.checked })}
                  className="size-4 shrink-0 rounded-[4px] border border-border-subtle accent-accent-teal"
                />
                <span className="truncate">{t("home.inStockOnly")}</span>
              </span>
              <span className="shrink-0 text-xs text-text-secondary">{inStockCount}</span>
            </label>
            <label className="flex h-9 w-full items-center justify-between gap-2 text-sm text-text-primary">
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={refine.onCampaign}
                  onChange={(e) => onRefineChange({ ...refine, onCampaign: e.target.checked })}
                  className="size-4 shrink-0 rounded-[4px] border border-border-subtle accent-accent-teal"
                />
                <span className="truncate">{t("home.onCampaign")}</span>
              </span>
              <span className="shrink-0 text-xs text-text-secondary">{campaignCount}</span>
            </label>
            <label className="flex h-9 w-full items-center justify-between gap-2 text-sm text-text-primary">
              <span className="flex min-w-0 items-center gap-2">
                <input
                  type="checkbox"
                  checked={refine.organic}
                  onChange={(e) => onRefineChange({ ...refine, organic: e.target.checked })}
                  className="size-4 shrink-0 rounded-[4px] border border-border-subtle accent-accent-teal"
                />
                <span className="truncate">{t("home.organic")}</span>
              </span>
              <span className="shrink-0 text-xs text-text-secondary">{organicCount}</span>
            </label>
          </div>

          <div className="mt-6 w-full rounded-lg border border-border-subtle bg-bg-card/40 p-4">
            <p className="font-logo text-sm font-semibold text-text-primary">
              {t("home.sameDayDeliveryTitle")}
            </p>
            <p className="mt-1 text-[13px] text-text-secondary">
              {t("home.sameDayDeliveryBody")}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
