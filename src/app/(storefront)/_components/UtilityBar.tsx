"use client";

import Link from "next/link";
import { useLocaleStore } from "@/app/_store/locale-store";
import { LOCALE_SHORT, LOCALES } from "@/i18n/config";
import { cn } from "@/app/utils/cn";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useTranslations } from "@/i18n/use-translations";

export function UtilityBar() {
  const { t, locale } = useTranslations();
  const setLocale = useLocaleStore((s) => s.setLocale);

  return (
    <div className="h-10 border-b border-border-subtle bg-bg-main">
      <div className="flex h-full w-full items-center justify-between px-8 text-[13px] text-text-secondary">
        <p suppressHydrationWarning className="min-w-0 truncate">
          {locale === "en"
            ? "Free delivery on orders over OMR 5.000 · Muscat & Seeb"
            : t("home.utilityFreeDelivery", { amount: "OMR 5.000" })}
        </p>
        <div className="flex shrink-0 items-center gap-6">
          <Link href="/orders" className="hover:text-text-primary" suppressHydrationWarning>
            {t("nav.trackOrder")}
          </Link>
          <Link href="/account" className="hover:text-text-primary" suppressHydrationWarning>
            {t("nav.help")}
          </Link>
          <div
            className="inline-flex items-center gap-0.5 rounded-full p-0.5"
            role="group"
            aria-label={t("common.language")}
          >
            {LOCALES.map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                suppressHydrationWarning
                className={cn(
                  "rounded-full px-2 py-0.5 text-[12px] font-medium transition-colors",
                  locale === code
                    ? "bg-accent-teal text-on-accent"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {LOCALE_SHORT[code]}
              </button>
            ))}
          </div>
          <ThemeToggle compact />
        </div>
      </div>
    </div>
  );
}
