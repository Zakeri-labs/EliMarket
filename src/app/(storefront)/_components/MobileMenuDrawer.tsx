"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import {
  ClipboardList,
  Heart,
  Home,
  LayoutGrid,
  MapPin,
  Search,
  ShoppingCart,
  User,
  X,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useAuthStore } from "@/app/_store/auth-store";
import { useCartStore } from "@/app/_store/cart-store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type MenuItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  exact?: boolean;
};

export function MobileMenuDrawer({ open, onOpenChange }: Props) {
  const pathname = usePathname();
  const { t, messages, locale } = useTranslations();
  const session = useAuthStore((s) => s.session);
  const authStatus = useAuthStore((s) => s.status);
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));
  const isLoggedIn = authStatus === "authenticated" && Boolean(session);

  const items: MenuItem[] = [
    { href: "/", label: t("nav.home"), icon: Home, exact: true },
    { href: "/categories", label: t("nav.categories"), icon: LayoutGrid },
    { href: "/search", label: t("nav.search"), icon: Search },
    { href: "/orders", label: t("nav.orders"), icon: ClipboardList },
    { href: "/favourites", label: t("account.favouritesLabel"), icon: Heart },
    { href: "/addresses", label: t("account.addressesLabel"), icon: MapPin },
    { href: "/cart", label: t("nav.cart"), icon: ShoppingCart },
    { href: "/account", label: t("nav.account"), icon: User },
  ];

  const close = () => onOpenChange(false);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/55 backdrop-blur-sm lg:hidden" />
        <Dialog.Content
          className={cn(
            "fixed inset-y-0 start-0 z-[61] flex w-[min(20rem,88vw)] flex-col border-e border-border bg-bg-main shadow-2xl outline-none lg:hidden",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
          aria-describedby={undefined}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-subtle px-4 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
            <div className="min-w-0">
              <Dialog.Title
                className={cn(
                  "truncate text-base tracking-wide text-text-primary",
                  locale !== "ar" && "font-logo",
                )}
              >
                {messages.brand.nameLocal}
              </Dialog.Title>
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {isLoggedIn
                  ? session?.fullName?.trim() || t("account.defaultUser")
                  : t("nav.signIn")}
              </p>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-subtle bg-bg-card text-text-secondary"
                aria-label={t("common.cancel")}
              >
                <AppIcon icon={X} size="md" />
              </button>
            </Dialog.Close>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto px-3 py-3">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={close}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        active
                          ? "bg-accent-teal/15 text-accent-teal"
                          : "text-text-primary hover:bg-bg-card",
                      )}
                    >
                      <AppIcon icon={item.icon} size="md" />
                      <span className="flex-1">{item.label}</span>
                      {item.href === "/cart" && cartCount > 0 ? (
                        <span className="rounded-full bg-accent-gold px-2 py-0.5 text-[10px] font-bold text-bg-main">
                          {cartCount}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="space-y-3 border-t border-border-subtle px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-text-secondary">{t("common.language")}</span>
              <LanguageTabs compact />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-text-secondary">{t("account.theme")}</span>
              <ThemeToggle compact />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
