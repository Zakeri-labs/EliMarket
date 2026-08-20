"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { getCategoryIcon } from "@/config/category-icons";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";
import { resolveCategoryName } from "@/lib/i18n/category-name";

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
    if (isSkeleton) return mockCategories(locale);
    if (categories?.length) return categories;
    return mockCategories(locale);
  }, [categories, isSkeleton, locale]);

  return (
    <section dir={dir}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-start text-base font-bold sm:text-lg">{t("home.categoriesTitle")}</h2>
        <Link href="/categories" className="shrink-0 text-sm font-medium text-accent">
          {t("home.viewAll")}
        </Link>
      </div>
      <div dir={dir} className="flex flex-wrap justify-start gap-2">
        {items.map((cat) => {
          const hasImage = Boolean(cat.image_url);

          return (
            <Link
              key={cat.id}
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex w-[4.5rem] shrink-0 flex-col items-center rounded-xl border border-border bg-surface-elevated px-1 pb-1.5 pt-1.5 sm:w-[5.25rem]",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="relative flex h-14 w-full items-center justify-center sm:h-16">
                {hasImage && cat.image_url ? (
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    width={64}
                    height={64}
                    sizes="64px"
                    withBlur={false}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  !isSkeleton && (
                    <AppIcon
                      icon={getCategoryIcon(cat.slug)}
                      size="md"
                      className="text-accent/80"
                    />
                  )
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
