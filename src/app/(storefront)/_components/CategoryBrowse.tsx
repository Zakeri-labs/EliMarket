"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { BrowseWithSidebar } from "@/app/(storefront)/_components/BrowseWithSidebar";
import {
  CategoryProductList,
  type CategoryListFilters,
  type CategorySortKey,
} from "@/app/(storefront)/_components/CategoryProductList";
import { CategorySideNav } from "@/app/(storefront)/_components/CategorySideNav";
import { FilterPanel } from "@/app/(storefront)/_components/FilterPanel";
import { useCategories } from "@/app/(storefront)/_hooks/use-categories";
import { useTranslations } from "@/i18n/use-translations";
import { resolveCategoryName } from "@/lib/i18n/category-name";
import { Select } from "@/components/ui/Select";

type Props = {
  slug?: string;
};

const fieldClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-accent";

export function CategoryBrowse({ slug }: Props) {
  const { t, locale, dir } = useTranslations();
  const { data: categories, isPending } = useCategories();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onSale, setOnSale] = useState(false);
  const [sort, setSort] = useState<CategorySortKey>("newest");

  const list = categories ?? [];
  const selected = slug ? list.find((item) => item.slug === slug) : undefined;
  const title = selected ? resolveCategoryName(selected, locale) : t("categories.title");

  const filters: CategoryListFilters = { minPrice, maxPrice, onSale, sort };
  const hasFilters = Boolean(minPrice || maxPrice || onSale);

  const clearFilters = () => {
    setMinPrice("");
    setMaxPrice("");
    setOnSale(false);
  };

  return (
    <main dir={dir} className="py-4 md:py-6">
      <div className="mb-4 flex min-h-8 items-center justify-between gap-3">
        <h1 className="text-start text-xl font-bold md:text-2xl">{title}</h1>
        {selected ? (
          <Link
            href="/categories"
            className="inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent-gold"
          >
            {t("home.viewAll")}
            <ArrowRight className="size-4 rtl:rotate-180" aria-hidden />
          </Link>
        ) : null}
      </div>
      <BrowseWithSidebar
        sidebar={
          <FilterPanel
            actions={
              hasFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="text-xs font-medium text-accent"
                >
                  {t("search.clearFilters")}
                </button>
              ) : null
            }
          >
            <CategorySideNav
              categories={list}
              selectedSlug={slug}
              hrefFor={(next) => (next ? `/categories/${next}` : "/categories")}
              withThumbnails
              isSkeleton={isPending}
            />
            <fieldset className="space-y-1.5">
              <legend className="text-xs font-medium text-muted">{t("search.priceLabel")}</legend>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min={0}
                  step="0.001"
                  className={fieldClass}
                  placeholder={t("search.minPrice")}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <input
                  type="number"
                  min={0}
                  step="0.001"
                  className={fieldClass}
                  placeholder={t("search.maxPrice")}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
            </fieldset>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={onSale}
                onChange={(e) => setOnSale(e.target.checked)}
              />
              {t("search.onSale")}
            </label>
            <label className="block space-y-1.5">
              <span className="text-xs font-medium text-muted">{t("search.sortLabel")}</span>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value as CategorySortKey)}
              >
                <option value="newest">{t("search.sortNewest")}</option>
                <option value="price-asc">{t("search.sortPriceAsc")}</option>
                <option value="price-desc">{t("search.sortPriceDesc")}</option>
              </Select>
            </label>
          </FilterPanel>
        }
      >
        <CategoryProductList slug={slug} filters={filters} />
      </BrowseWithSidebar>
    </main>
  );
}
