"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, ShoppingCart } from "lucide-react";
import { useCartStore } from "@/app/_store/cart-store";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

export function StorefrontHeader() {
  const pathname = usePathname();
  const cartCount = useCartStore((s) =>
    s.items.reduce((sum, item) => sum + item.quantity, 0),
  );
  const { t, messages } = useTranslations();

  const NAV_LINKS = [
    { href: "/", label: t("nav.home"), exact: true },
    { href: "/categories", label: t("nav.categories") },
    { href: "/search", label: t("nav.search") },
    { href: "/orders", label: t("nav.orders") },
    { href: "/account", label: t("nav.account") },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-md">
      <div className={cn(STOREFRONT_CONTAINER, "py-3 md:py-4")}>
        {/* Mobile — mockup-style bar */}
        <div className="flex items-center justify-between gap-3 md:hidden">
          <Link
            href="/categories"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface"
            aria-label={t("nav.categories")}
          >
            <AppIcon icon={Menu} size="md" />
          </Link>
          <Link href="/" className="min-w-0 flex-1 text-center">
            <p className="truncate font-serif text-base font-bold tracking-wide">
              {messages.brand.nameLocal}
            </p>
          </Link>
          <Link
            href="/cart"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-black",
              pathname === "/cart" && "ring-2 ring-accent/40 ring-offset-2 ring-offset-background",
            )}
            aria-label={t("nav.cart")}
          >
            <AppIcon icon={ShoppingCart} size="md" />
            {cartCount > 0 && (
              <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-accent">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Desktop */}
        <div className="hidden items-center justify-between gap-4 md:flex">
          <Link href="/" className="shrink-0">
            <p className="font-serif text-lg font-bold tracking-wide">{messages.brand.nameLocal}</p>
          </Link>

          <nav className="flex flex-1 items-center justify-center gap-1">
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

          <div className="flex items-center gap-3">
            <LanguageTabs compact className="hidden sm:inline-flex" />
            <Link
              href="/search"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-elevated px-3 py-2 text-sm text-muted hover:text-foreground"
            >
              <AppIcon icon={Search} size="sm" />
              {t("nav.searchShortcut")}
            </Link>
            <Link
              href="/cart"
              className={cn(
                "relative flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90",
                pathname === "/cart" && "ring-2 ring-accent/40 ring-offset-2 ring-offset-background",
              )}
            >
              <AppIcon icon={ShoppingCart} size="sm" />
              {t("nav.cart")}
              {cartCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold text-accent">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
