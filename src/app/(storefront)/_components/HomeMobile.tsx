"use client";

import { useMemo, useState } from "react";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { CategoryGrid } from "@/app/(storefront)/_components/CategoryGrid";
import { FilterSheet } from "@/app/(storefront)/_components/FilterSheet";
import { FlashDeals } from "@/app/(storefront)/_components/FlashDeals";
import { HeroCarousel } from "@/app/(storefront)/_components/HeroCarousel";
import { HomeFilterBar } from "@/app/(storefront)/_components/HomeFilterBar";
import { LocationBar, SearchBar } from "@/app/(storefront)/_components/HomeSections";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import type { ShopRefine } from "@/app/(storefront)/_components/ShopSidebar";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import { applyHomeFilters, isOrganicProduct, type HomePill } from "@/lib/products/home-filters";
import { productCompareAtPrice } from "@/lib/products/pricing";

type SortKey = "newest" | "price-asc" | "price-desc";

const DEFAULT_REFINE: ShopRefine = { inStock: true, onCampaign: false, organic: false };

export function HomeMobile() {
  const { t, locale, dir } = useTranslations();
  const { data: products, isPending, error } = useProducts();
  const catalog = useMemo(
    () => (products?.length ? products : mockProducts(locale)),
    [products, locale],
  );

  const [refine, setRefine] = useState<ShopRefine>(DEFAULT_REFINE);
  const [pill, setPill] = useState<HomePill | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [sheetOpen, setSheetOpen] = useState(false);

  const togglePill = (id: HomePill) =>
    setPill((current) => (current === id ? null : id));

  const resetFilters = () => {
    setRefine(DEFAULT_REFINE);
    setPill(null);
    setSort("newest");
  };

  const pills = useMemo(() => {
    const list = catalog;
    return [
      { id: "campaigns" as const, count: list.filter((p) => p.campaign).length },
      { id: "newest" as const, count: list.length },
      { id: "bestsellers" as const, count: Math.min(list.length, 30) },
      {
        id: "discounted" as const,
        count: list.filter((p) => productCompareAtPrice(p) != null || p.campaign).length,
      },
      { id: "under1" as const, count: list.filter((p) => Number(p.price) < 1).length },
      {
        id: "local" as const,
        count: list.filter((p) => p.category?.slug?.includes("produce")).length,
      },
    ];
  }, [catalog]);

  const filtered = useMemo(() => {
    const next = applyHomeFilters(catalog, { ...refine, pill });
    return [...next].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (pill === "bestsellers") return b.stock - a.stock;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [catalog, refine, pill, sort]);

  const refineCounts = useMemo(
    () => ({
      inStock: catalog.filter((p) => p.stock > 0).length,
      onCampaign: catalog.filter((p) => p.campaign).length,
      organic: catalog.filter(isOrganicProduct).length,
    }),
    [catalog],
  );

  const activeFilterCount =
    Number(refine.inStock) + Number(refine.onCampaign) + Number(refine.organic);

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-3">
        <LocationBar />
        <SearchBar />
      </div>
      <HeroCarousel />
      <CategoryGrid />
      <div dir={dir}>
        <HomeFilterBar
          pills={pills}
          active={pill}
          onToggle={togglePill}
          sort={sort}
          onSort={setSort}
          onOpenFilters={() => setSheetOpen(true)}
          filterCount={activeFilterCount}
        />
      </div>
      <FlashDeals />
      <section dir={dir}>
        <h2 className="mb-4 text-start text-base font-bold sm:text-lg">
          {t("home.allProducts")}
        </h2>
        {error && !isPending ? (
          <p className="rounded-2xl border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
            {error.message}
          </p>
        ) : !isPending && filtered.length === 0 ? (
          <p className="text-sm text-muted">{t("home.noProducts")}</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {(isPending ? mockProducts(locale) : filtered).map((product, index) => (
              <ProductDealCard
                key={product.id}
                product={product}
                isSkeleton={isPending}
                priority={index < 4}
                layout="grid"
              />
            ))}
          </div>
        )}
      </section>

      <FilterSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        pills={pills}
        activePill={pill}
        onTogglePill={togglePill}
        sort={sort}
        onSort={setSort}
        refine={refine}
        onRefineChange={setRefine}
        refineCounts={refineCounts}
        resultCount={filtered.length}
        onReset={resetFilters}
      />
    </div>
  );
}
