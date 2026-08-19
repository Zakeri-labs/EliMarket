"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Search } from "lucide-react";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { CategoryProductList } from "@/app/(storefront)/_components/CategoryProductList";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { getCategoryIcon } from "@/config/category-icons";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";

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
          <h1 className="text-start font-bold">{selected?.name ?? slug}</h1>
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
              className={cn(
                "flex items-center gap-3 rounded-2xl border border-border bg-surface p-3",
                isSkeleton && "skeleton pointer-events-none",
              )}
              onClick={(e) => {
                if (isSkeleton) e.preventDefault();
              }}
              aria-busy={isSkeleton}
            >
              <span className="target relative flex h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-surface-elevated">
                {!isSkeleton && cat.image_url ? (
                  <StorefrontImage
                    src={cat.image_url}
                    blurHash={cat.blur_hash}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                ) : (
                  !isSkeleton && (
                    <AppIcon icon={getCategoryIcon(cat.slug)} size="lg" className="text-accent" />
                  )
                )}
              </span>
              <span className="flex-1 text-start font-medium">{cat.name}</span>
              <AppIcon icon={ChevronLeft} size="sm" className="text-muted rtl:rotate-180" />
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
