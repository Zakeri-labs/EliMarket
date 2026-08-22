"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  children: React.ReactNode;
  actions?: React.ReactNode;
};

export function FilterPanel({ children, actions }: Props) {
  const { t } = useTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-border bg-surface p-3 sm:p-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-start font-medium md:pointer-events-none"
          onClick={() => setOpen((value) => !value)}
        >
          <AppIcon icon={SlidersHorizontal} size="sm" className="text-accent" />
          {t("search.filters")}
          <AppIcon
            icon={ChevronDown}
            size="sm"
            className={cn("ms-auto text-muted transition-transform md:hidden", open && "rotate-180")}
          />
        </button>
        {actions}
      </div>
      <div className={cn("mt-4 space-y-4", open ? "block" : "hidden md:block")}>
        {children}
      </div>
    </div>
  );
}
