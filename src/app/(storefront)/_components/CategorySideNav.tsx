"use client";

import Link from "next/link";
import { cn } from "@/app/utils/cn";
import type { Category } from "@/app/_types/database.types";
import { useTranslations } from "@/i18n/use-translations";
import { childCategories, topLevelCategories } from "@/lib/categories/tree";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type Props = {
  categories: Category[];
  selectedSlug?: string;
  /** When set, each item is a link (category pages). Otherwise `onSelect` is used (search filters). */
  hrefFor?: (slug: string) => string;
  onSelect?: (slug: string) => void;
};

export function CategorySideNav({
  categories,
  selectedSlug = "",
  hrefFor,
  onSelect,
}: Props) {
  const { t, locale } = useTranslations();
  const parents = topLevelCategories(categories);

  function itemClass(active: boolean) {
    return cn(
      "block w-full rounded-lg px-2 py-1.5 text-start text-sm transition-colors",
      active
        ? "bg-accent/15 font-medium text-accent"
        : "text-foreground hover:bg-surface-elevated",
    );
  }

  function CategoryItem({
    slug,
    label,
    nested = false,
  }: {
    slug: string;
    label: string;
    nested?: boolean;
  }) {
    const active = selectedSlug === slug;
    const className = cn(itemClass(active), nested && "text-[13px]");
    if (hrefFor) {
      return (
        <Link href={hrefFor(slug)} className={className}>
          {label}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onSelect?.(slug)} className={className}>
        {label}
      </button>
    );
  }

  return (
    <nav aria-label={t("search.categoryLabel")}>
      <p className="mb-2 text-xs font-medium text-muted">{t("search.categoryLabel")}</p>
      <ul className="space-y-0.5">
        <li>
          {hrefFor ? (
            <Link href={hrefFor("")} className={itemClass(!selectedSlug)}>
              {t("search.allCategories")}
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onSelect?.("")}
              className={itemClass(!selectedSlug)}
            >
              {t("search.allCategories")}
            </button>
          )}
        </li>
        {parents.map((cat) => {
          const nested = childCategories(categories, cat.id);
          return (
            <li key={cat.id}>
              <CategoryItem slug={cat.slug} label={resolveCategoryName(cat, locale)} />
              {nested.length > 0 ? (
                <ul className="ms-2 mt-0.5 space-y-0.5 border-s border-border ps-2">
                  {nested.map((child) => (
                    <li key={child.id}>
                      <CategoryItem
                        slug={child.slug}
                        label={resolveCategoryName(child, locale)}
                        nested
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
