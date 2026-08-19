"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { AppIcon } from "@/components/icons/AppIcon";
import { getCategoryIcon } from "@/config/category-icons";
import { useTranslations } from "@/i18n/use-translations";

export function CategoryGrid() {
  const { t } = useTranslations();
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await getCategoriesAction();
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const items = categories?.slice(0, 4) ?? [
    { id: "1", name: t("home.fallbackProduce"), slug: "produce" },
    { id: "2", name: t("home.fallbackDairy"), slug: "dairy" },
    { id: "3", name: t("home.fallbackMeat"), slug: "meat" },
    { id: "4", name: t("home.fallbackBakery"), slug: "bakery" },
  ];

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-bold">{t("home.categoriesTitle")}</h2>
        <Link href="/categories" className="text-xs text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-1 lg:gap-4">
        {items.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories?slug=${cat.slug}`}
            className="relative overflow-hidden rounded-2xl bg-surface-elevated p-4 min-h-[88px] border border-border"
          >
            <p className="relative z-10 text-sm font-semibold">{cat.name}</p>
            <AppIcon
              icon={getCategoryIcon(cat.slug)}
              size="xl"
              className="absolute -bottom-2 -start-2 opacity-30"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
