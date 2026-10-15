"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/app/utils/cn";
import type { Category } from "@/app/_types/database.types";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";
import { childCategories, topLevelCategories } from "@/lib/categories/tree";
import { resolveCategoryImage } from "@/lib/categories/image";
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
  isSkeleton?: boolean;
};

/**
 * Same photographic thumbs as the home "Shop by category" list.
 * Falls back to the category glyph only if the image is missing or fails.
 */
function CategoryThumb({
  category,
  size,
  active,
  hideImage = false,
}: {
  category: Category;
  size: number;
  active: boolean;
  hideImage?: boolean;
}) {
  const src = resolveCategoryImage(category);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src) && !imgFailed && !hideImage;

  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg bg-transparent",
      )}
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element -- fixed small thumb only
        <img
          key={src}
          src={src!}
          alt=""
          width={size}
          height={size}
          className="absolute inset-0 z-[1] box-border object-contain"
          style={{ width: size, height: size, maxWidth: size, maxHeight: size }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        <AppIcon
          icon={getCategoryIcon(category.slug)}
          size={size <= 28 ? "xs" : "sm"}
          className="text-accent-teal/70"
        />
      )}
    </span>
  );
}

export function CategorySideNav({
  categories,
  selectedSlug = "",
  hrefFor,
  onSelect,
  withThumbnails = false,
  isSkeleton = false,
}: Props) {
  const { t, locale } = useTranslations();
  const parents = topLevelCategories(categories);

  function itemClass(active: boolean) {
    if (withThumbnails) {
      return cn(
        "flex min-h-[62px] w-full items-center gap-3 rounded-xl border px-3 py-2 text-start text-[13px] font-medium transition-colors",
        active
          ? "border-transparent bg-[#f1e2c6] text-[#1a1408]"
          : "border-border-subtle bg-bg-card text-text-primary hover:border-[#f1e2c6]/40",
      );
    }
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
            size={nested ? 32 : 48}
            active={active}
            hideImage={isSkeleton}
          />
        ) : null}
        <span className={cn("min-w-0 flex-1", withThumbnails ? "line-clamp-2 leading-tight" : "truncate")}>{label}</span>
        {withThumbnails ? <ChevronRight className="size-4 shrink-0 opacity-70 rtl:rotate-180" aria-hidden /> : null}
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
      <p className={cn("mb-2 text-xs font-medium text-muted", withThumbnails && "sr-only")}>{t("search.categoryLabel")}</p>
      <ul className={withThumbnails ? "space-y-2" : "space-y-0.5"}>
        <li className={withThumbnails ? "hidden" : undefined}>
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
