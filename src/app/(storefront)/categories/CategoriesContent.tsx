"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { CategoryProductList } from "@/app/(storefront)/_components/CategoryProductList";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { getCategoryIcon } from "@/config/category-icons";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";
import { childCategories, topLevelCategories } from "@/lib/categories/tree";
import { resolveCategoryName } from "@/lib/i18n/category-name";

export default function CategoriesContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
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
  const selected = categories?.find((c) => c.slug === slug);
  const children = selected && categories ? childCategories(categories, selected.id) : [];
  const listCategories = useMemo(
    () => (isSkeleton ? mockCategories(locale) : topLevelCategories(categories ?? [])),
    [categories, isSkeleton, locale],
  );

  if (slug) {
    return (
      <main dir={dir} className="py-4 md:py-6">
        <div className="mb-4 flex items-center gap-2">
          <Link href="/categories" className="inline-flex items-center gap-1 text-sm text-accent">
            <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
            {t("categories.back")}
          </Link>
          <h1 className="text-start font-bold">
            {selected ? resolveCategoryName(selected, locale) : slug}
          </h1>
        </div>
        {children.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2">
            {children.map((child) => (
              <Link
                key={child.id}
                href={`/categories/${child.slug}`}
                className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs"
              >
                {resolveCategoryName(child, locale)}
              </Link>
            ))}
          </div>
        )}
        <CategoryProductList slug={slug} />
      </main>
    );
  }

  return (
    <main dir={dir} className="py-4 md:py-6">
      <h1 className="mb-4 text-start text-xl font-bold">{t("categories.title")}</h1>
      <div className="mb-4 flex items-center gap-2 rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm text-muted">
        <AppIcon icon={Search} size="sm" />
        <span className="text-start">{t("categories.searchInCategories")}</span>
      </div>
      <ul className="space-y-2">
        {listCategories.map((cat) => {
          const nested = isSkeleton ? [] : childCategories(categories ?? [], cat.id);
          return (
          <li key={cat.id} className="space-y-2">
            <Link
              href={isSkeleton ? "#" : `/categories/${cat.slug}`}
              dir={dir}
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent">
                {!isSkeleton && cat.image_url ? (
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    width={56}
                    height={56}
                    sizes="56px"
                    withBlur={false}
                    className="max-h-full max-w-full bg-transparent object-contain"
                  />
                ) : (
                  !isSkeleton && (
                    <AppIcon icon={getCategoryIcon(cat.slug)} size="lg" className="text-accent" />
                  )
                )}
              </span>
                    <span className="flex-1 text-start font-medium">
                      {resolveCategoryName(cat, locale)}
                    </span>
                    {nested.length > 0 && (
                      <span className="text-[10px] text-muted">{nested.length}</span>
                    )}
              <AppIcon icon={ChevronRight} size="sm" className="shrink-0 text-muted rtl:rotate-180" />
            </Link>
            {nested.length > 0 && (
              <ul className="ms-8 space-y-1.5">
                {nested.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/categories/${child.slug}`}
                      className="flex items-center justify-between rounded-xl border border-border/70 bg-surface-elevated px-3 py-2 text-sm"
                    >
                      {resolveCategoryName(child, locale)}
                      <AppIcon icon={ChevronRight} size="sm" className="text-muted rtl:rotate-180" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </li>
          );
        })}
      </ul>
    </main>
  );
}
