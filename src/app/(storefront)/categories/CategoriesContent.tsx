"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Search } from "lucide-react";
import { getCategoriesAction, getProductsAction } from "@/app/_actions/product-actions";
import { ProductCard } from "@/app/(storefront)/_components/ProductCard";
import { AppIcon } from "@/components/icons/AppIcon";
import { getCategoryIcon } from "@/config/category-icons";
import { useTranslations } from "@/i18n/use-translations";

export default function CategoriesContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const { t } = useTranslations();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await getCategoriesAction();
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const { data: products } = useQuery({
    queryKey: ["products", slug],
    queryFn: async () => {
      const r = await getProductsAction();
      if (!r.success) throw new Error(r.error);
      const all = r.data;
      if (!slug) return all;
      return all.filter((p) => p.category?.slug === slug);
    },
  });

  const selected = categories?.find((c) => c.slug === slug);

  if (slug && products) {
    return (
      <main className="py-4 md:py-6">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/categories" className="inline-flex items-center gap-1 text-sm text-accent">
            <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
            {t("categories.back")}
          </Link>
          <h1 className="font-bold">{selected?.name ?? slug}</h1>
        </div>
        <div className="space-y-2">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} compact />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="py-4 md:py-6">
      <h1 className="mb-4 text-xl font-bold">{t("categories.title")}</h1>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-muted">
        <AppIcon icon={Search} size="sm" />
        {t("categories.searchInCategories")}
      </div>
      <ul className="space-y-2">
        {categories?.map((cat) => (
          <li key={cat.id}>
            <Link
              href={`/categories?slug=${cat.slug}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-3"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-elevated">
                <AppIcon icon={getCategoryIcon(cat.slug)} size="lg" className="text-accent" />
              </span>
              <span className="flex-1 font-medium">{cat.name}</span>
              <AppIcon icon={ChevronLeft} size="sm" className="text-muted rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
