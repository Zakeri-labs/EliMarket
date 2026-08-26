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
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

/** Mobile / tablet app bar — mirrors hamburger destinations; desktop uses header nav */
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
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-bg-main/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div
        className={cn(
          STOREFRONT_CONTAINER,
          "grid grid-cols-5 items-stretch gap-0.5 py-1.5",
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
                "relative flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 text-[10px] font-medium transition-colors",
                active ? "text-accent-teal" : "text-text-secondary",
              )}
            >
              {active ? (
                <span
                  className="absolute inset-x-2 top-0 h-0.5 rounded-full bg-accent-teal"
                  aria-hidden
                />
              ) : null}
              <AppIcon icon={tab.icon} size="md" />
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
