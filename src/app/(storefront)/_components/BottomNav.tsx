"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Home,
  LayoutGrid,
  Search,
  User,
} from "lucide-react";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

/** Mobile only — desktop uses header nav */
export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslations();

  const TABS: { href: string; label: string; icon: LucideIcon; exact?: boolean }[] = [
    { href: "/", label: t("nav.home"), icon: Home, exact: true },
    { href: "/categories", label: t("nav.categories"), icon: LayoutGrid },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { href: "/account", label: t("nav.account"), icon: User },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
      <div className="border-b border-border px-4 py-2">
        <LanguageTabs className="w-full justify-center" />
      </div>
      <div
        className={cn(
          STOREFRONT_CONTAINER,
          "flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        )}
      >
        {TABS.map((tab) => {
          const active = tab.exact
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex min-w-[3rem] flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] transition-colors",
                active ? "text-accent" : "text-muted",
              )}
            >
              <AppIcon icon={tab.icon} size="md" />
              <span>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
