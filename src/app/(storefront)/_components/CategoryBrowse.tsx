"use client";

import { useQuery } from "@tanstack/react-query";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { BrowseWithSidebar } from "@/app/(storefront)/_components/BrowseWithSidebar";
import { CategoryProductList } from "@/app/(storefront)/_components/CategoryProductList";
import { CategorySideNav } from "@/app/(storefront)/_components/CategorySideNav";
import { FilterPanel } from "@/app/(storefront)/_components/FilterPanel";
import { mockCategories } from "@/app/(storefront)/_mocks/category-mock";
import { useTranslations } from "@/i18n/use-translations";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type Props = {
  slug?: string;
};

export function CategoryBrowse({ slug }: Props) {
  const { t, locale, dir } = useTranslations();
  const { data: categories, isPending } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const r = await getCategoriesAction();
      if (!r.success) throw new Error(r.error);
      return r.data;
    },
  });

  const list = isPending ? mockCategories(locale) : (categories ?? []);
  const selected = slug ? list.find((item) => item.slug === slug) : undefined;
  const title = selected ? resolveCategoryName(selected, locale) : t("categories.title");

  return (
    <main dir={dir} className="py-4 md:py-6">
      <h1 className="mb-4 text-start text-xl font-bold md:text-2xl">{title}</h1>
      <BrowseWithSidebar
        sidebar={
          <FilterPanel>
            <CategorySideNav
              categories={list}
              selectedSlug={slug}
              hrefFor={(next) => (next ? `/categories/${next}` : "/categories")}
            />
          </FilterPanel>
        }
      >
        <CategoryProductList slug={slug} />
      </BrowseWithSidebar>
    </main>
  );
}
