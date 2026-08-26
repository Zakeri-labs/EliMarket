"use client";

import { useEffect, useRef, useState } from "react";
import { Filter, X } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

type ColumnFilterProps = {
  children: React.ReactNode;
  isActive: boolean;
  onClear: () => void;
  title?: string;
};

export function ColumnFilter({
  children,
  isActive,
  onClear,
  title,
}: ColumnFilterProps) {
  const { t } = useTranslations();
  const resolvedTitle = title ?? t("table.columnFilter");
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          "!h-7 !w-7 !rounded-lg !p-0",
          isActive && "!text-[#0f766e]",
        )}
        onClick={() => setOpen((v) => !v)}
        aria-label={resolvedTitle}
      >
        <AppIcon icon={Filter} size="xs" />
      </Button>

      {open && (
        <div className="absolute start-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#e4e4e7] bg-white p-4 shadow-lg">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold text-[#18181b]">{resolvedTitle}</h4>
            {isActive && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="!h-7 !px-2 text-red-600"
                onClick={() => {
                  onClear();
                  setOpen(false);
                }}
              >
                <AppIcon icon={X} size="xs" />
                {t("table.clear")}
              </Button>
            )}
          </div>
          <div className="space-y-3">{children}</div>
          <div className="mt-4 flex justify-end border-t border-[#e4e4e7] pt-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="border-[#e4e4e7]"
              onClick={() => setOpen(false)}
            >
              {t("table.close")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
