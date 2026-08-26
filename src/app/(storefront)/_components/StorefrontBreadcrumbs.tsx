"use client";

import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { cn } from "@/app/utils/cn";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

type Props = {
  items: BreadcrumbItem[];
  className?: string;
};

export function StorefrontBreadcrumbs({ items, className }: Props) {
  if (items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn(
        "mb-4 flex flex-wrap items-center gap-1.5 text-xs text-muted md:mb-6 md:text-sm",
        className,
      )}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <Fragment key={`${item.label}-${index}`}>
            {index > 0 ? (
              <AppIcon
                icon={ChevronLeft}
                size="xs"
                className="shrink-0 rotate-180 opacity-60 rtl:rotate-0"
              />
            ) : null}
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={cn(isLast && "truncate text-foreground")}>{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
