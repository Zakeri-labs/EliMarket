"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { useTranslations } from "@/i18n/use-translations";
import { productDescriptionSearchText } from "@/lib/i18n/product-description";
import { categoryAndDescendantSlugs, topLevelCategories } from "@/lib/categories/tree";
import { productCompareAtPrice } from "@/lib/products/pricing";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type SortKey = "newest" | "price-asc" | "price-desc";

export function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQuery);
  const [categorySlug, setCategorySlug] = useState(searchParams.get("category") ?? "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");
  const [onSale, setOnSale] = useState(searchParams.get("sale") === "1");
  const [sort, setSort] = useState<SortKey>((searchParams.get("sort") as SortKey) || "newest");
  const { data: products } = useProducts();
  const { t, dir, locale } = useTranslations();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const result = await getCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filtered = useMemo(() => {
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;
    const slugs = categorySlug && categories
      ? categoryAndDescendantSlugs(categories, categorySlug)
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
      if (onSale) {
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
  }, [products, q, categorySlug, categories, minPrice, maxPrice, onSale, sort]);

  const parents = categories ? topLevelCategories(categories) : [];

  return (
    <main dir={dir} className="py-4 md:py-6">
      <h1 className="mb-4 text-xl font-bold">{t("search.title")}</h1>
      <input
        className="mb-4 w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent"
        placeholder={t("search.placeholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <select
          className="rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
        >
          <option value="">{t("search.allCategories")}</option>
          {parents.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {resolveCategoryName(cat, locale)}
            </option>
          ))}
        </select>
        <input
          type="number"
          min={0}
          step="0.001"
          className="rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          placeholder={t("search.minPrice")}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
        />
        <input
          type="number"
          min={0}
          step="0.001"
          className="rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          placeholder={t("search.maxPrice")}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select
          className="rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 text-sm"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
        >
          <option value="newest">{t("search.sortNewest")}</option>
          <option value="price-asc">{t("search.sortPriceAsc")}</option>
          <option value="price-desc">{t("search.sortPriceDesc")}</option>
        </select>
        <label className="flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-3 py-2.5 text-sm">
          <input type="checkbox" checked={onSale} onChange={(e) => setOnSale(e.target.checked)} />
          {t("search.onSale")}
        </label>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {filtered.map((p, index) => (
          <ProductDealCard key={p.id} product={p} priority={index < 4} layout="grid" />
        ))}
      </div>
      {q && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">{t("search.noResults")}</p>
      )}
      {!q && (
        <p className="mt-4 text-center text-sm text-muted">
          {t("search.hintPrefix")}{" "}
          <Link href="/categories" className="text-accent">
            {t("search.hintCategories")}
          </Link>{" "}
          {t("search.hintSuffix")}
        </p>
      )}
    </main>
  );
}
