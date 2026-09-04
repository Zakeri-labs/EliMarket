"use client";

import Link from "next/link";
import { useMemo } from "react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { getCategoryIcon } from "@/config/category-icons";
import { useCategories } from "@/app/(storefront)/_hooks/use-categories";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";
import { resolveCategoryName } from "@/lib/i18n/category-name";
import { resolveCategoryImage } from "@/lib/categories/image";

const HOME_CATEGORY_SLOTS = 16;

export function CategoryGrid() {
  const { t, locale, dir } = useTranslations();
  const { data: categories, isPending } = useCategories();

  const isSkeleton = isPending;

  const items = useMemo(() => {
    const source = isSkeleton
      ? mockCategories(locale)
      : categories?.length
        ? categories
        : mockCategories(locale);
    return source.filter((cat) => !cat.parent_id).slice(0, HOME_CATEGORY_SLOTS);
  }, [categories, isSkeleton, locale]);

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-start text-base font-bold sm:text-lg">{t("home.categoriesTitle")}</h2>
        <Link href="/categories" className="shrink-0 text-sm font-medium text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8">
        {items.map((cat) => {
          const imageSrc = resolveCategoryImage(cat);
          const hasImage = Boolean(imageSrc);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex flex-col items-center rounded-xl border border-border bg-surface-elevated px-1 pb-1.5 pt-1.5 sm:rounded-2xl sm:px-2 sm:py-2",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="relative flex h-14 w-full items-center justify-center bg-transparent sm:h-16">
                {isSkeleton ? (
                  <SkeletonImage />
                ) : hasImage && imageSrc ? (
                  <StorefrontImage
                    src={imageSrc}
                    blurHash={cat.blur_hash}
                    alt=""
                    fill
                    sizes="64px"
                    withBlur={false}
                    className="object-contain"
                  />
                ) : (
                  <AppIcon
                    icon={getCategoryIcon(cat.slug)}
                    size="md"
                    className="text-accent/80"
                  />
                )}
              </span>
              <p className="mt-1 line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-foreground sm:text-xs">
                {resolveCategoryName(cat, locale)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
