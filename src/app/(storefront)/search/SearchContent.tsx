"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { getLiveCampaignsAction } from "@/app/_actions/campaign-actions";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { BrowseWithSidebar } from "@/app/(storefront)/_components/BrowseWithSidebar";
import { CategorySideNav } from "@/app/(storefront)/_components/CategorySideNav";
import { FilterPanel } from "@/app/(storefront)/_components/FilterPanel";
import { StableProductGrid } from "@/app/(storefront)/_components/StableProductGrid";
import { useTranslations } from "@/i18n/use-translations";
import { productDescriptionSearchText } from "@/lib/i18n/product-description";
import { categoryAndDescendantSlugs } from "@/lib/categories/tree";
import { productCompareAtPrice } from "@/lib/products/pricing";
import type { LiveCampaignOption } from "@/lib/campaigns/load";

type SortKey = "newest" | "price-asc" | "price-desc";

function resolveCampaign(
  campaigns: LiveCampaignOption[] | undefined,
  param: string,
) {
  if (!param) return null;
  return (
    campaigns?.find((campaign) => campaign.id === param || campaign.slug === param) ?? null
  );
}

const fieldClass =
  "w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm outline-none focus:border-accent";

export function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const [onSale, setOnSale] = useState(searchParams.get("sale") === "1");
  const [campaignParam, setCampaignParam] = useState(searchParams.get("campaign") ?? "");
  const [sort, setSort] = useState<SortKey>((searchParams.get("sort") as SortKey) || "newest");
  const { data: products } = useProducts();
  const { t, dir } = useTranslations();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const { data: campaigns } = useQuery({
    queryKey: ["live-campaigns"],
    queryFn: async () => {
      const result = await getLiveCampaignsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
    setCategorySlug(searchParams.get("category") ?? "");
    setCampaignParam(searchParams.get("campaign") ?? "");
    setOnSale(searchParams.get("sale") === "1");
  }, [searchParams]);

  const selectedCampaign = resolveCampaign(campaigns, campaignParam);

  const results = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const slugs =
      categorySlug && categories
        ? categoryAndDescendantSlugs(categories, categorySlug)
        : null;
    const campaignProductIds = selectedCampaign
      ? new Set(selectedCampaign.product_ids)
      : null;

    const list = (products ?? []).filter((p) => {
      const matchesQuery =
        !q.trim() ||
        p.name.includes(q) ||
        productDescriptionSearchText(p).includes(q) ||
        (p.category?.name.includes(q) ?? false);
      if (!matchesQuery) return false;
      if (slugs && (!p.category || !slugs.includes(p.category.slug))) return false;
      if (min != null && !Number.isNaN(min) && Number(p.price) < min) return false;
      if (max != null && !Number.isNaN(max) && Number(p.price) > max) return false;
      if (campaignProductIds) {
        if (!campaignProductIds.has(p.id)) return false;
      } else if (campaignParam) {
        if (p.campaign?.id !== campaignParam && p.campaign?.slug !== campaignParam) return false;
      } else if (onSale) {
        const compareAt = productCompareAtPrice(p);
        if (compareAt == null || compareAt <= Number(p.price)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      return b.created_at.localeCompare(a.created_at);
    });
  }, [
    products,
    q,
    categorySlug,
    categories,
    minPrice,
    maxPrice,
    onSale,
    sort,
    campaignParam,
    selectedCampaign,
  ]);

  const hasActiveFilters = Boolean(
    q.trim() || campaignParam || onSale || categorySlug || minPrice || maxPrice,
  );
  const hasSidebarFilters = Boolean(campaignParam || onSale || categorySlug || minPrice || maxPrice);

  const applyCampaignFilter = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      const campaign = resolveCampaign(campaigns, value);
      params.set("campaign", campaign ? campaign.slug || campaign.id : value);
      params.delete("sale");
      setOnSale(false);
    } else {
      params.delete("campaign");
    }
    const query = params.toString();
    router.replace(query ? `/search?${query}` : "/search", { scroll: false });
  };

  const clearFilters = () => {
    setCategorySlug("");
    setMinPrice("");
    setMaxPrice("");
    setOnSale(false);
    setCampaignParam("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("campaign");
    params.delete("sale");
    params.delete("category");
    params.delete("min");
    params.delete("max");
    const query = params.toString();
    router.replace(query ? `/search?${query}` : "/search", { scroll: false });
  };

  return (
    <main dir={dir} className="py-4 md:py-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            {selectedCampaign?.name || t("search.title")}
          </h1>
          {hasActiveFilters ? (
            <p className="mt-1 text-sm text-muted">
              {t("search.resultsCount", { count: results.length })}
            </p>
          ) : null}
        </div>
        <label className="hidden items-center gap-2 text-sm md:flex">
          <span className="text-muted">{t("search.sortLabel")}</span>
          <select
            className="rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm outline-none focus:border-accent"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="newest">{t("search.sortNewest")}</option>
            <option value="price-asc">{t("search.sortPriceAsc")}</option>
            <option value="price-desc">{t("search.sortPriceDesc")}</option>
          </select>
        </label>
      </div>

      <input
        className="mb-4 w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent md:hidden"
        placeholder={t("search.placeholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={!campaignParam}
      />

      <BrowseWithSidebar
        sidebar={
          <FilterPanel
            actions={
              hasSidebarFilters ? (
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
              categories={categories ?? []}
              selectedSlug={categorySlug}
              onSelect={setCategorySlug}
            />
            {(campaigns?.length || campaignParam) ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-muted">{t("search.campaignLabel")}</span>
                <select
                  className={fieldClass}
                  value={selectedCampaign?.id || campaignParam}
                  onChange={(e) => applyCampaignFilter(e.target.value)}
                >
                  <option value="">{t("search.allCampaigns")}</option>
                  {(campaigns ?? []).map((campaign) => (
                    <option key={campaign.id} value={campaign.id}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
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
                disabled={Boolean(campaignParam)}
                onChange={(e) => setOnSale(e.target.checked)}
              />
              {t("search.onSale")}
            </label>
            <label className="block space-y-1.5 md:hidden">
              <span className="text-xs font-medium text-muted">{t("search.sortLabel")}</span>
              <select
                className={fieldClass}
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
              >
                <option value="newest">{t("search.sortNewest")}</option>
                <option value="price-asc">{t("search.sortPriceAsc")}</option>
                <option value="price-desc">{t("search.sortPriceDesc")}</option>
              </select>
            </label>
          </FilterPanel>
        }
      >
        <StableProductGrid
          products={results}
          minSlots={8}
          priorityCount={4}
          className="xl:!grid-cols-4"
          emptyMessage={
            hasActiveFilters ? t("search.noResults") : undefined
          }
        />
        {!hasActiveFilters && results.length === 0 ? (
          <p className="mt-4 text-center text-sm text-muted">
            {t("search.hintPrefix")}{" "}
            <Link href="/categories" className="text-accent">
              {t("search.hintCategories")}
            </Link>{" "}
            {t("search.hintSuffix")}
          </p>
        ) : null}
      </BrowseWithSidebar>
    </main>
  );
}
