"use client";

import type { ReactNode } from "react";
import { cn } from "@/app/utils/cn";

/** One slim row for catalog items: small thumbnail, name, order and actions. */
export function CompactItemCard({
  image,
  title,
  subtitle,
  order,
  orderLabel,
  selected = false,
  openLabel,
  onOpen,
  actions,
}: {
  image: string | null | undefined;
  title: string;
  subtitle?: ReactNode;
  order: number;
  orderLabel: string;
  selected?: boolean;
  openLabel: string;
  onOpen: () => void;
  actions: ReactNode;
}) {
  return (
    <article
      className={cn(
        "admin-card flex h-full min-w-0 items-center gap-3 p-2 pe-1.5",
        selected && "outline-2 -outline-offset-2 outline-accent",
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        aria-label={`${openLabel}: ${title}`}
        className="flex min-h-12 min-w-0 flex-1 items-center gap-3 rounded-xl text-start"
      >
        <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-background">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="size-full object-contain p-1" />
          ) : (
            <span className="text-xs font-semibold text-muted">{title.slice(0, 2)}</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-foreground">{title}</span>
          {subtitle ? <span className="block truncate text-xs text-muted">{subtitle}</span> : null}
        </span>
      </button>
      <span title={`${orderLabel} ${order}`} className="shrink-0 text-xs font-medium text-muted tabular-nums">
        <span className="sr-only">{`${orderLabel} ${order}`}</span>
        <span aria-hidden>#{order}</span>
      </span>
      <span className="shrink-0">{actions}</span>
    </article>
  );
}
