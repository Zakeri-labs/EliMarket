"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart } from "lucide-react";
import { useAuthStore } from "@/app/_store/auth-store";
import { useCartStore } from "@/app/_store/cart-store";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AppIcon } from "@/components/icons/AppIcon";
import { CategoryNav } from "@/app/(storefront)/_components/CategoryNav";
import { DeliverToDropdown } from "@/app/(storefront)/_components/DeliverToDropdown";
import { MobileMenuDrawer } from "@/app/(storefront)/_components/MobileMenuDrawer";
import { StorefrontSearchBar } from "@/app/(storefront)/_components/StorefrontSearchBar";
import { UtilityBar } from "@/app/(storefront)/_components/UtilityBar";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useTranslations } from "@/i18n/use-translations";
import { LOCALE_SHORT, LOCALES } from "@/i18n/config";

/**
 * Main storefront header.
 * Desktop (≥1024px): UtilityBar → one 80px main row (logo | deliver | search | account/cart) → CategoryNav.
 * Mobile: compact bar + hamburger drawer. Never duplicates the desktop main row.
 */
export function StorefrontHeader() {
  const pathname = usePathname();
  const items = useCartStore((s) => s.items);
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const session = useAuthStore((s) => s.session);
  const authStatus = useAuthStore((s) => s.status);
  const { t, messages, locale } = useTranslations();
  const setLocale = useLocaleStore((s) => s.setLocale);
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const prevCartCountRef = useRef(cartCount);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (mounted && cartCount > prevCartCountRef.current) {
      setCartBump(true);
      const timeout = setTimeout(() => setCartBump(false), 500);
      prevCartCountRef.current = cartCount;
      return () => clearTimeout(timeout);
    }
    prevCartCountRef.current = cartCount;
  }, [cartCount, mounted]);

  const brandClass =
    locale === "ar"
      ? "font-bold tracking-wide"
      : "font-logo font-semibold tracking-wide";

  const countBadge = mounted ? cartCount : 0;
  const isLoggedIn = mounted && authStatus === "authenticated" && Boolean(session);
  const accountPrimary = isLoggedIn
    ? (session?.fullName?.trim() || t("account.defaultUser"))
    : t("nav.signIn");

  return (
    <header className="sticky top-0 z-40 bg-bg-main">
      {/* Mobile only */}
      <div className={cn(STOREFRONT_CONTAINER, "border-b border-border-subtle py-3 lg:hidden")}>
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-card"
            aria-label={t("nav.menu")}
            aria-expanded={menuOpen}
          >
            <AppIcon icon={Menu} size="md" />
          </button>
          <Link href="/" className="min-w-0 flex-1 text-center">
            <p className={cn("truncate text-base", brandClass)}>
              {messages.brand.nameLocal}
            </p>
          </Link>
          <ThemeToggle compact />
          <div
            className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-xl border border-border-subtle bg-bg-card p-0.5"
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
                  "rounded-lg px-1.5 py-1 text-[11px] font-semibold uppercase transition-colors",
                  locale === code
                    ? "bg-accent-teal text-on-accent"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                {LOCALE_SHORT[code]}
              </button>
            ))}
          </div>
          <Link
            href="/cart"
            className={cn(
              "relative flex h-10 w-10 items-center justify-center rounded-xl bg-accent-teal text-on-accent",
              pathname === "/cart" && "ring-2 ring-accent-teal/40 ring-offset-2 ring-offset-bg-main",
            )}
            aria-label={t("nav.cart")}
          >
            <AppIcon icon={ShoppingCart} size="md" className={cn(cartBump && "animate-cart-bump")} />
            {countBadge > 0 ? (
              <span className="absolute -end-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-gold px-1 text-[10px] font-bold text-bg-main">
                {countBadge}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <MobileMenuDrawer open={menuOpen} onOpenChange={setMenuOpen} />

      {/* Desktop only — min-width 1024px (lg) */}
      <div className="hidden lg:block">
        <UtilityBar />

        {/* Single main header row — exactly 4 sections, LTR */}
        <div
          dir="ltr"
          className="flex h-20 w-full items-center justify-between border-b border-border-subtle bg-bg-main px-8"
        >
          {/* 1) Logo */}
          <Link href="/" className="w-[240px] shrink-0">
            <span className="font-logo block whitespace-nowrap text-[22px] leading-none tracking-[0.15em] text-text-primary uppercase">
              HILLS ELI MART
            </span>
          </Link>

          {/* 2) Deliver to */}
          <DeliverToDropdown className="mx-4 w-[220px] shrink-0" />

          {/* 3) Search — grows, capped at 700px, centered in remaining space */}
          <div className="flex min-w-0 flex-1 justify-center px-4">
            <StorefrontSearchBar
              size="desktop"
              className="w-full max-w-[700px]"
              placeholder="Search for products, brands and categories"
            />
          </div>

          {/* 4) Account + Cart — hide "Sign in" when authenticated */}
          <div className="flex w-[260px] shrink-0 items-center justify-end gap-4">
            <Link href="/account" className="flex min-w-0 shrink-0 items-center gap-2.5 text-start leading-tight">
              {isLoggedIn && session?.avatarUrl ? (
                <span className="relative hidden h-9 w-9 shrink-0 overflow-hidden rounded-full bg-accent/20 sm:block">
                  <StorefrontImage
                    src={session.avatarUrl}
                    blurHash={session.avatarBlurHash}
                    alt=""
                    fill
                    sizes="36px"
                    className="object-cover"
                  />
                </span>
              ) : null}
              <span className="min-w-0">
                <span className="block text-[11px] text-text-secondary">{t("nav.account")}</span>
                <span
                  suppressHydrationWarning
                  className="block max-w-[9rem] truncate text-[14px] font-bold text-text-primary"
                >
                  {accountPrimary}
                </span>
              </span>
            </Link>
            <Link
              href="/cart"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg bg-accent-teal text-on-accent"
              aria-label={t("nav.cart")}
            >
              <AppIcon icon={ShoppingCart} size="md" className={cn(cartBump && "animate-cart-bump")} />
              {countBadge > 0 ? (
                <span
                  suppressHydrationWarning
                  className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent-gold px-1 text-[11px] font-bold text-bg-main"
                >
                  {countBadge}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        <CategoryNav />
      </div>
    </header>
  );
}
