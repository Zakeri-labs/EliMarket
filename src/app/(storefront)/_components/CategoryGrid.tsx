"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { getCategoryIcon } from "@/config/category-icons";
import { mockCategoryGrid } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";

export function CategoryGrid() {
  const { t, locale, dir } = useTranslations();
  const { data: categories, isPending } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await getCategoriesAction();
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const isSkeleton = isPending;

  const items = useMemo(() => {
    if (isSkeleton) return mockCategoryGrid(locale);
    if (categories?.length) return categories.slice(0, 8);
    return [
      {
        id: "1",
        name: t("home.fallbackProduce"),
        slug: "produce",
        sort_order: 0,
        image_url: null,
        blur_hash: null,
        created_at: "",
      },
      {
        id: "2",
        name: t("home.fallbackDairy"),
        slug: "dairy",
        sort_order: 1,
        image_url: null,
        blur_hash: null,
        created_at: "",
      },
      {
        id: "3",
        name: t("home.fallbackMeat"),
        slug: "meat",
        sort_order: 2,
        image_url: null,
        blur_hash: null,
        created_at: "",
      },
      {
        id: "4",
        name: t("home.fallbackBakery"),
        slug: "bakery",
        sort_order: 3,
        image_url: null,
        blur_hash: null,
        created_at: "",
      },
    ];
  }, [categories, isSkeleton, locale, t]);

  return (
    <section dir={dir}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-start font-bold">{t("home.categoriesTitle")}</h2>
        <Link href="/categories" className="shrink-0 text-xs font-medium text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div
        dir={dir}
        className="no-scrollbar -mx-4 flex justify-start gap-3 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {items.map((cat) => {
          const hasImage = Boolean(cat.image_url);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "relative flex h-28 w-28 shrink-0 flex-col items-start overflow-hidden rounded-2xl border border-border p-3 sm:h-32 sm:w-32",
                hasImage ? "justify-end" : "bg-surface-elevated",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              {hasImage && cat.image_url && (
                <>
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    fill
                    sizes="128px"
                    withBlur={!isSkeleton}
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
                </>
              )}
              <p
                className={cn(
                  "relative z-10 line-clamp-2 text-start text-xs font-semibold leading-snug sm:text-sm",
                  hasImage && "text-white",
                )}
              >
                {cat.name}
              </p>
              {!isSkeleton && !hasImage && (
                <AppIcon
                  icon={getCategoryIcon(cat.slug)}
                  size="2xl"
                  className="absolute -bottom-1 -start-1 opacity-25"
                />
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
