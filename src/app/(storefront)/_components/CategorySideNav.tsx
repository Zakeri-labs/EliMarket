"use client";

import Link from "next/link";
import { cn } from "@/app/utils/cn";
import type { Category } from "@/app/_types/database.types";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";
import { childCategories, topLevelCategories } from "@/lib/categories/tree";
import { getCategoryIcon } from "@/config/category-icons";
import { resolveCategoryName } from "@/lib/i18n/category-name";

type Props = {
  categories: Category[];
  selectedSlug?: string;
  /** When set, each item is a link (category pages). Otherwise `onSelect` is used (search filters). */
  hrefFor?: (slug: string) => string;
  onSelect?: (slug: string) => void;
  /** Show a small category image/icon next to each label. */
  withThumbnails?: boolean;
};

/**
 * Monochrome category glyph on a theme-aware chip. We intentionally do not use
 * the category photos here: those images carry baked-in (light or dark) studio
 * backdrops that cannot follow the active theme, so at this small size they
 * render as stray light/dark discs. An icon on `bg-bg-tile` stays dark in dark
 * mode and light in light mode.
 */
function CategoryThumb({
  category,
  size,
  active,
}: {
  category: Category;
  size: number;
  active: boolean;
}) {
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border bg-bg-tile",
        active ? "border-accent text-accent" : "border-border-subtle text-accent/70",
      )}
      style={{ width: size, height: size }}
    >
      <AppIcon icon={getCategoryIcon(category.slug)} size="xs" />
    </span>
  );
}

export function CategorySideNav({
  categories,
  selectedSlug = "",
  hrefFor,
  onSelect,
  withThumbnails = false,
}: Props) {
  const { t, locale } = useTranslations();
  const parents = topLevelCategories(categories);

  function itemClass(active: boolean) {
    return cn(
      "flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start text-sm transition-colors",
      active
        ? "bg-accent/15 font-medium text-accent"
        : "text-foreground hover:bg-surface-elevated",
    );
  }

  function CategoryItem({
    category,
    label,
    nested = false,
  }: {
    category: Category;
    label: string;
    nested?: boolean;
  }) {
    const active = selectedSlug === category.slug;
    const className = cn(itemClass(active), nested && "text-[13px]");
    const content = (
      <>
        {withThumbnails ? (
          <CategoryThumb
            category={category}
            size={nested ? 22 : 28}
            active={active}
          />
        ) : null}
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </>
    );
    if (hrefFor) {
      return (
        <Link href={hrefFor(category.slug)} className={className}>
          {content}
        </Link>
      );
    }
    return (
      <button type="button" onClick={() => onSelect?.(category.slug)} className={className}>
        {content}
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
              <CategoryItem category={cat} label={resolveCategoryName(cat, locale)} />
              {nested.length > 0 ? (
                <ul className="ms-2 mt-0.5 space-y-0.5 border-s border-border ps-2">
                  {nested.map((child) => (
                    <li key={child.id}>
                      <CategoryItem
                        category={child}
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
