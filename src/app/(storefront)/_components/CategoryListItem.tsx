"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Category } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { getCategoryIcon } from "@/config/category-icons";
import { resolveCategoryImage } from "@/lib/categories/image";

type Props = {
  category: Category;
  label: string;
  active?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  depth?: number;
  isSkeleton?: boolean;
  onSelect: () => void;
  onToggleExpand?: () => void;
};

export function CategoryListItem({
  category,
  label,
  active = false,
  hasChildren = false,
  expanded = false,
  depth = 0,
  onSelect,
  onToggleExpand,
  isSkeleton = false,
}: Props) {
  const THUMB = depth > 0 ? 32 : 44;
  const src = resolveCategoryImage(category);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src) && !imgFailed && !isSkeleton;

  return (
    <div
      className={cn(
        "group flex w-full max-w-full shrink-0 items-center gap-2 overflow-hidden rounded-md px-1",
        depth > 0 ? "h-[44px] ps-3" : "h-[56px]",
        active && "bg-accent-teal/10",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden text-start"
      >
        {/* Must be block/inline-block — width/height are ignored on bare inline spans.
           Background is the theme-aware `bg-bg-card` token (dark in dark mode, light
           in light mode); no striped placeholder — the category PNGs are transparent
           so a hatch would show through behind the product. */}
        <span
          className={cn(
            "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border bg-bg-card",
            active ? "border-accent-teal" : "border-border-subtle",
          )}
          style={{ width: THUMB, height: THUMB, minWidth: THUMB, minHeight: THUMB }}
        >
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed small thumb only
            <img
              key={src}
              src={src!}
              alt=""
              width={THUMB}
              height={THUMB}
              className="absolute inset-0 z-[1] box-border object-contain p-0.5"
              style={{ width: THUMB, height: THUMB, maxWidth: THUMB, maxHeight: THUMB }}
              onError={() => setImgFailed(true)}
            />
          ) : (
            <AppIcon
              icon={getCategoryIcon(category.slug)}
              size={depth > 0 ? "xs" : "sm"}
              className="text-accent-teal/70"
            />
          )}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate transition-colors",
            depth > 0 ? "text-sm" : "text-[15px]",
            active
              ? "font-medium text-accent-teal"
              : "text-text-primary group-hover:text-accent-teal",
          )}
        >
          {label}
        </span>
      </button>
      {hasChildren ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand?.();
          }}
          className="flex size-7 shrink-0 items-center justify-center text-text-secondary hover:text-accent-teal"
          aria-expanded={expanded}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <AppIcon
            icon={expanded ? ChevronDown : ChevronRight}
            size="xs"
            className={cn(!expanded && "rtl:rotate-180")}
          />
        </button>
      ) : (
        <span className="flex size-7 shrink-0 items-center justify-center text-text-secondary opacity-50">
          <AppIcon icon={ChevronRight} size="xs" className="rtl:rotate-180" />
        </span>
      )}
    </div>
  );
}
