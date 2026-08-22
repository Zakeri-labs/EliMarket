"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { Category } from "@/app/_types/database.types";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StripePlaceholder } from "@/components/ui/StripePlaceholder";
import { resolveCategoryImage } from "@/lib/categories/image";

type Props = {
  category: Category;
  label: string;
  active?: boolean;
  hasChildren?: boolean;
  expanded?: boolean;
  depth?: number;
  onSelect: () => void;
  onToggleExpand?: () => void;
};

const THUMB = 28;

export function CategoryListItem({
  category,
  label,
  active = false,
  hasChildren = false,
  expanded = false,
  depth = 0,
  onSelect,
  onToggleExpand,
}: Props) {
  const src = resolveCategoryImage(category);
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = Boolean(src) && !imgFailed;

  return (
    <div
      className={cn(
        "group flex h-[42px] w-full max-w-full shrink-0 items-center gap-2 overflow-hidden rounded-md px-1",
        depth > 0 && "ps-3",
        active && "bg-accent-teal/10",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden text-start"
      >
        {/* Must be block/inline-block — width/height are ignored on bare inline spans */}
        <span
          className={cn(
            "relative block shrink-0 overflow-hidden rounded-full border bg-bg-card",
            active ? "border-accent-teal" : "border-border-subtle",
          )}
          style={{ width: THUMB, height: THUMB, minWidth: THUMB, minHeight: THUMB }}
        >
          <StripePlaceholder className="pointer-events-none absolute inset-0" />
          {showImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed 28px thumb only
            <img
              src={src!}
              alt=""
              width={THUMB}
              height={THUMB}
              className="absolute inset-0 z-[1] box-border object-contain p-0.5"
              style={{ width: THUMB, height: THUMB, maxWidth: THUMB, maxHeight: THUMB }}
              onError={() => setImgFailed(true)}
            />
          ) : null}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-sm transition-colors",
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
