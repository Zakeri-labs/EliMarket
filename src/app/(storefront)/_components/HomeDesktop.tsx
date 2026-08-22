"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { FlashDeals } from "@/app/(storefront)/_components/FlashDeals";
import { HeroBanner } from "@/app/(storefront)/_components/HeroBanner";
import { HomeFilterBar } from "@/app/(storefront)/_components/HomeFilterBar";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { ShopSidebar, type ShopRefine } from "@/app/(storefront)/_components/ShopSidebar";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { mockProducts } from "@/app/(storefront)/_mocks/product-mock";
import { useTranslations } from "@/i18n/use-translations";
import {
  applyHomeFilters,
  type HomePill,
} from "@/lib/products/home-filters";
import { productCompareAtPrice } from "@/lib/products/pricing";
import { categoryDescendantIds } from "@/lib/categories/tree";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type SortKey = "newest" | "price-asc" | "price-desc";

export function HomeDesktop() {
  const { t, locale } = useTranslations();
  const { data: products, isPending } = useProducts();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const categoryList = categories?.length ? categories : mockCategories(locale);
  const catalog = products?.length ? products : mockProducts(locale);
  const [refine, setRefine] = useState<ShopRefine>({
    inStock: true,
    onCampaign: false,
    organic: false,
  });
  const [pill, setPill] = useState<HomePill | null>(null);
  const [sort, setSort] = useState<SortKey>("newest");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const selectedCategoryIds = useMemo(() => {
    if (!selectedCategoryId) return null;
    return [selectedCategoryId, ...categoryDescendantIds(categoryList, selectedCategoryId)];
  }, [categoryList, selectedCategoryId]);

  const selectedCategorySlugs = useMemo(() => {
    if (!selectedCategoryIds?.length) return null;
    return selectedCategoryIds
      .map((id) => categoryList.find((c) => c.id === id)?.slug)
      .filter((slug): slug is string => Boolean(slug));
  }, [categoryList, selectedCategoryIds]);

  const selectedCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categoryList.find((c) => c.id === selectedCategoryId);
    return cat ? resolveCategoryName(cat, locale) : null;
  }, [categoryList, locale, selectedCategoryId]);

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
    const next = applyHomeFilters(catalog, {
      ...refine,
      pill,
      categoryIds: selectedCategoryIds,
      categorySlugs: selectedCategorySlugs,
    });
    return [...next].sort((a, b) => {
      if (sort === "price-asc") return Number(a.price) - Number(b.price);
      if (sort === "price-desc") return Number(b.price) - Number(a.price);
      if (pill === "bestsellers") return b.stock - a.stock;
      return b.created_at.localeCompare(a.created_at);
    });
  }, [catalog, refine, pill, sort, selectedCategoryIds, selectedCategorySlugs]);

  /* English: force LTR so sidebar stays physical LEFT (260px column).
     fa/ar: RTL so sidebar sits on the inline-start (right). */
  return (
    <div
      dir={locale === "en" ? "ltr" : "rtl"}
      className="flex flex-row items-start gap-8 py-6"
    >
      <ShopSidebar
        categories={categoryList}
        products={catalog}
        refine={refine}
        onRefineChange={setRefine}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
      />
      <div className="min-w-0 flex-1 space-y-8">
        <HeroBanner />
        <HomeFilterBar
          pills={pills}
          active={pill}
          onToggle={(id) => setPill((current) => (current === id ? null : id))}
          sort={sort}
          onSort={setSort}
        />
        {!selectedCategoryId ? <FlashDeals limit={5} /> : null}
        <section id="home-product-grid">
          <h2 className="mb-4 text-start text-lg font-semibold">
            {selectedCategoryName ?? t("home.allProducts")}
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {(isPending ? mockProducts(locale).slice(0, 10) : filtered).map((product, index) => (
              <ProductDealCard
                key={product.id}
                product={product}
                isSkeleton={isPending}
                layout="grid"
                priority={index < 5}
              />
            ))}
          </div>
          {!isPending && filtered.length === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">{t("home.noProducts")}</p>
          ) : null}
        </section>
      </div>
    </div>
  );
}
