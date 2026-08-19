"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock, Search, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/app/_store/cart-store";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function StorefrontHeader() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) => s.totalItems());
  const { t, messages } = useTranslations();
  const { showPrices } = useStoreSettings();

  const NAV_LINKS = [
    { href: "/", label: t("nav.home"), exact: true },
    { href: "/categories", label: t("nav.categories") },
    { href: "/search", label: t("nav.search") },
    { href: "/orders", label: t("nav.orders") },
    { href: "/account", label: t("nav.account") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className={cn(STOREFRONT_CONTAINER, "flex items-center justify-between gap-4 py-3 md:py-4")}>
        <Link href="/" className="shrink-0 text-center md:text-start">
          <p className="text-sm font-bold tracking-wide md:text-lg">{messages.brand.nameLocal}</p>
        </Link>

        <nav className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {NAV_LINKS.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-xl px-4 py-2 text-sm transition-colors",
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageTabs compact className="hidden sm:inline-flex" />
          <Link
            href="/search"
            className="hidden items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-muted hover:text-foreground sm:inline-flex"
          >
            <AppIcon icon={Search} size="sm" />
            {t("nav.searchShortcut")}
          </Link>
          {showPrices ? (
            <Link
              href="/cart"
              className="relative flex items-center gap-2 rounded-xl bg-accent px-3 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90 md:px-4"
            >
              <AppIcon icon={ShoppingCart} size="sm" />
              <span className="hidden sm:inline">{t("nav.cart")}</span>
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-accent">
                  {cartCount}
                </span>
              )}
            </Link>
          ) : (
            <span
              className="flex cursor-not-allowed items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-muted md:px-4"
              title={t("store.cartClosedDesc")}
            >
              <AppIcon icon={Lock} size="sm" />
              <span className="hidden sm:inline">{t("store.pricesHidden")}</span>
            </span>
          )}
        </div>
      </div>
    </header>
  );
}
