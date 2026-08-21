"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { SkeletonImage } from "@/components/ui/SkeletonImage";
import { getCategoryIcon } from "@/config/category-icons";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";
import { resolveCategoryName } from "@/lib/i18n/category-name";

/** One homepage row: 5 on mobile, 8 on tablet, 10 on desktop. The rest is on /categories. */
const HOME_CATEGORY_SLOTS = 10;

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
      <div dir={dir} className="flex flex-nowrap gap-2">
        {items.map((cat, index) => {
          const hasImage = Boolean(cat.image_url);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex w-0 min-w-0 max-w-[20%] flex-1 flex-col items-center rounded-xl border border-border bg-surface-elevated px-1 pb-1.5 pt-1.5",
                index >= 5 && "hidden",
                index < 8 && "sm:flex",
                index >= 8 && "lg:flex",
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
                ) : hasImage && cat.image_url ? (
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    withBlur={false}
                    className="max-h-full max-w-full bg-transparent object-contain"
                  />
                ) : (
                  <AppIcon
                    icon={getCategoryIcon(cat.slug)}
                    size="md"
                    className="text-accent/80"
                  />
                )}
              </span>
              <p className="mt-1 line-clamp-2 w-full text-center text-[10px] font-medium leading-tight text-foreground">
                {resolveCategoryName(cat, locale)}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
