"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
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
        <Link href="/categories" className="shrink-0 text-sm font-medium text-accent-gold">
          {t("home.viewAll")}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.map((cat) => {
          const imageSrc = resolveCategoryImage(cat);
          const hasImage = Boolean(imageSrc);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex h-[64px] items-center gap-1 overflow-hidden rounded-xl border border-[#f1e2c6] bg-bg-card ps-1 pe-2 transition-colors",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="relative flex h-[56px] w-[84px] shrink-0 items-center justify-center bg-transparent">
                {isSkeleton ? (
                  <SkeletonImage />
                ) : hasImage && imageSrc ? (
                  <StorefrontImage
                    src={imageSrc}
                    blurHash={cat.blur_hash}
                    alt=""
                    fill
                    sizes="88px"
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
              <p className="line-clamp-2 min-w-0 flex-1 text-start text-[13px] font-medium leading-tight text-text-primary">
                {resolveCategoryName(cat, locale)}
              </p>
              <AppIcon icon={ChevronRight} size="sm" className="shrink-0 text-text-primary rtl:rotate-180" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
