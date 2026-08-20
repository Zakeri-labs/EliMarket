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
import { resolveCategoryName } from "@/lib/i18n/category-name";

const HOMEPAGE_CATEGORY_COUNT = 4;

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
    if (categories?.length) return categories.slice(0, HOMEPAGE_CATEGORY_COUNT);
    return mockCategoryGrid(locale);
  }, [categories, isSkeleton, locale]);

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-start text-base font-bold sm:text-lg">{t("home.categoriesTitle")}</h2>
        <Link href="/categories" className="shrink-0 text-sm font-medium text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div
        dir={dir}
        className="no-scrollbar -mx-4 flex justify-start gap-3 overflow-x-auto px-4 sm:-mx-6 sm:gap-3.5 sm:px-6 lg:-mx-8 lg:px-8"
      >
        {items.map((cat) => {
          const hasImage = Boolean(cat.image_url);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex w-[5.75rem] shrink-0 flex-col items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-2 pb-3 pt-2.5 sm:w-24",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="relative flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-white sm:h-28">
                {hasImage && cat.image_url ? (
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    width={88}
                    height={88}
                    sizes="88px"
                    withBlur={!isSkeleton}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  !isSkeleton && (
                    <AppIcon
                      icon={getCategoryIcon(cat.slug)}
                      size="2xl"
                      className="text-accent/80"
                    />
                  )
                )}
              </span>
              <p className="line-clamp-2 w-full text-center text-[11px] font-medium leading-snug text-foreground sm:text-xs">
                {resolveCategoryName(cat, locale)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
