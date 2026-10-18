"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShoppingCart, User } from "lucide-react";
import { useAuthStore } from "@/app/_store/auth-store";
import { useCartStore } from "@/app/_store/cart-store";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";
import { STOREFRONT_CONTAINER } from "@/config/layout";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { AppIcon } from "@/components/icons/AppIcon";
import { DeliverToDropdown } from "@/app/(storefront)/_components/DeliverToDropdown";
import { MobileMenuDrawer } from "@/app/(storefront)/_components/MobileMenuDrawer";
import { StorefrontSearchBar } from "@/app/(storefront)/_components/StorefrontSearchBar";
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
  const { t, locale } = useTranslations();
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
          <Link
            href="/"
            dir="ltr"
            className="flex min-w-0 flex-1 items-center justify-center gap-2"
            aria-label="Hills Eli Mart"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img
              src="/brand-logo.png"
              alt=""
              width={62}
              height={60}
              className="h-9 w-auto shrink-0 [html.theme-light_&]:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img
              src="/brand-logo-light.png"
              alt=""
              width={62}
              height={60}
              className="hidden h-9 w-auto shrink-0 [html.theme-light_&]:block"
            />
            <span className="font-logo truncate text-[13px] font-medium uppercase leading-none tracking-[0.12em] text-text-primary">
              Hills Eli Mart
            </span>
          </Link>
          <ThemeToggle compact />
          <div
            className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-xl bg-bg-card p-0.5"
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

      {/* Desktop only — min-width 1024px (lg): logo | search | area | account | cart */}
      <div className="hidden lg:block">
        <div
          dir="ltr"
          className="flex h-[84px] w-full items-center gap-[clamp(12px,1.6vw,24px)] border-b border-border-subtle bg-bg-main px-[clamp(16px,2.4vw,40px)]"
        >
          <Link href="/" className="flex shrink-0 items-center gap-4" aria-label="Hills Eli Mart">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img
              src="/brand-logo.png"
              alt=""
              width={62}
              height={60}
              className="h-[clamp(44px,4.2vw,64px)] w-auto [html.theme-light_&]:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed brand mark */}
            <img
              src="/brand-logo-light.png"
              alt=""
              width={62}
              height={60}
              className="hidden h-[clamp(44px,4.2vw,64px)] w-auto [html.theme-light_&]:block"
            />
            <span>
              <span className="font-logo block whitespace-nowrap text-[clamp(16px,1.7vw,27px)] font-medium leading-none tracking-[0.16em] text-text-primary uppercase">
                HILLS ELI MART
              </span>
              <span className="mt-2 block whitespace-nowrap text-[clamp(7px,0.62vw,10px)] leading-none tracking-[0.34em] text-text-secondary uppercase">
                GOOD FOOD&nbsp;&nbsp;BETTER LIVING
              </span>
            </span>
          </Link>

          <div className="flex min-w-[280px] flex-1 justify-start">
            <StorefrontSearchBar
              size="desktop"
              className="w-full max-w-[640px]"
              placeholder="Search for products, brands and categories"
            />
          </div>

          <DeliverToDropdown className="!w-[clamp(150px,14vw,225px)] shrink-0" />

          <span className="h-9 w-px shrink-0 bg-border-subtle" aria-hidden />

          <Link
            href="/account"
            className="flex shrink-0 items-center gap-2 text-[13px] font-normal text-text-primary"
          >
            {isLoggedIn && session?.avatarUrl ? (
              <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-accent/20">
                <StorefrontImage
                  src={session.avatarUrl}
                  blurHash={session.avatarBlurHash}
                  alt=""
                  fill
                  sizes="36px"
                  className="object-cover"
                />
              </span>
            ) : (
              <AppIcon icon={User} size="sm" />
            )}
            <span suppressHydrationWarning className="max-w-[5.5rem] truncate">
              {accountPrimary}
            </span>
          </Link>

          <span className="h-9 w-px shrink-0 bg-border-subtle" aria-hidden />

          <Link
            href="/cart"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center text-text-primary"
            aria-label={t("nav.cart")}
          >
            <AppIcon icon={ShoppingCart} size="md" className={cn(cartBump && "animate-cart-bump")} />
            <span
              suppressHydrationWarning
              className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-accent-teal px-1 text-[12px] font-bold text-on-accent"
            >
              {countBadge}
            </span>
          </Link>

          <div className="flex shrink-0 items-center gap-2">
            <div className="inline-flex items-center gap-0.5" role="group" aria-label={t("common.language")}>
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
    </header>
  );
}
