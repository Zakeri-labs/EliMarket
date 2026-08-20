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
  const listCategories = useMemo(
    () => (isSkeleton ? mockCategories(locale) : (categories ?? [])),
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
        {listCategories.map((cat) => (
          <li key={cat.id}>
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
              <AppIcon icon={ChevronRight} size="sm" className="shrink-0 text-muted rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
