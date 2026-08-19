"use client";

import { useState } from "react";
import Link from "next/link";
import { useProducts } from "@/app/(storefront)/_hooks/use-products";
import { ProductCard } from "@/app/(storefront)/_components/ProductCard";
import { useTranslations } from "@/i18n/use-translations";

export default function SearchPage() {
  const [q, setQ] = useState("");
  const { data: products } = useProducts();
  const { t } = useTranslations();

  const filtered =
    products?.filter(
      (p) =>
        !q.trim() ||
        p.name.includes(q) ||
        p.description?.includes(q) ||
        p.category?.name.includes(q),
    ) ?? [];

  return (
    <main className="py-4 md:py-6">
      <h1 className="mb-4 text-xl font-bold">{t("search.title")}</h1>
      <input
        className="mb-4 w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none focus:border-accent"
        placeholder={t("search.placeholder")}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus
      />
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      {q && filtered.length === 0 && (
        <p className="mt-8 text-center text-sm text-muted">{t("search.noResults")}</p>
      )}
      {!q && (
        <p className="mt-4 text-center text-sm text-muted">
          {t("search.hintPrefix")}{" "}
          <Link href="/categories" className="text-accent">{t("search.hintCategories")}</Link>{" "}
          {t("search.hintSuffix")}
        </p>
      )}
    </main>
  );
}
