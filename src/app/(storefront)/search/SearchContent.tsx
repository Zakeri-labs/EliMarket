"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductDealCard } from "@/app/(storefront)/_components/ProductDealCard";
import { useTranslations } from "@/i18n/use-translations";
import { productDescriptionSearchText } from "@/lib/i18n/product-description";

export function SearchContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQuery);
  const { data: products } = useProducts();
  const { t, dir } = useTranslations();

  useEffect(() => {
    setQ(searchParams.get("q") ?? "");
  }, [searchParams]);

  const filtered =
    products?.filter(
      (p) =>
        !q.trim() ||
        p.name.includes(q) ||
        productDescriptionSearchText(p).includes(q) ||
        p.category?.name.includes(q),
    ) ?? [];

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
      <div className="-mx-4 flex flex-wrap justify-start gap-3 px-4 sm:-mx-6 sm:px-6">
        {filtered.map((p, index) => (
          <ProductDealCard key={p.id} product={p} priority={index < 4} />
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
