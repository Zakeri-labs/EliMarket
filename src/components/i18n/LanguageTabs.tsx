"use client";

import { LOCALES, LOCALE_SHORT, type Locale } from "@/i18n/config";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";

type Props = {
  className?: string;
  compact?: boolean;
};

export function LanguageTabs({ className, compact = false }: Props) {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div
      className={cn(
        "inline-flex rounded-xl border border-border bg-surface-elevated p-0.5",
        className?.includes("w-full") && "flex w-full justify-center",
        className,
      )}
      role="tablist"
      aria-label="Language"
    >
      {LOCALES.map((code) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setLocale(code as Locale)}
            className={cn(
              "rounded-lg px-2.5 py-1 text-xs font-medium transition-colors",
              compact && "px-2 py-0.5 text-[10px]",
              active
                ? "bg-accent text-black"
                : "text-muted hover:text-foreground",
            )}
          >
            {LOCALE_SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
