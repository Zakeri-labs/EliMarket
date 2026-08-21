"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { signOutAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useUiStore } from "@/app/_store/ui-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";
import { AppIcon } from "@/components/icons/AppIcon";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

const NAV_KEYS = [
  { href: "/dashboard", key: "admin.nav.dashboard" },
  { href: "/dashboard/products", key: "admin.nav.products" },
  { href: "/dashboard/products/smart", key: "admin.nav.smartProduct" },
  { href: "/dashboard/categories", key: "admin.nav.categories" },
  { href: "/dashboard/brands", key: "admin.nav.brands" },
  { href: "/dashboard/banners", key: "admin.nav.banners" },
  { href: "/dashboard/orders", key: "admin.nav.orders" },
  { href: "/dashboard/reports", key: "admin.nav.reports" },
  { href: "/dashboard/customers", key: "admin.nav.customers" },
  { href: "/dashboard/coverage-area", key: "admin.nav.coverage" },
] as const;

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const toggleMobile = useUiStore((s) => s.toggleMobile);
  const mobileOpen = useUiStore((s) => s.mobileOpen);
  const setMobileOpen = useUiStore((s) => s.setMobileOpen);
  const clearSession = useAuthStore((s) => s.clearSession);
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
      {mobileOpen && (
        <button
          type="button"
          aria-label={t("admin.closeMenu")}
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 flex w-64 shrink-0 flex-col overflow-hidden border-e border-[#e4e4e7] bg-white p-5 shadow-lg transition-transform md:static md:h-full md:translate-x-0 md:shadow-none",
          mobileOpen
            ? "translate-x-0"
            : "max-md:-translate-x-full max-md:rtl:translate-x-full",
        )}
      >
        <div className="mb-6 flex shrink-0 items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#6b8f71]">{t("admin.panelLabel")}</p>
            <p className="text-lg font-bold text-[#527559]">{t("admin.brandAdmin")}</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[#71717a] hover:bg-[#f4f4f5] md:hidden"
            onClick={closeMobile}
            aria-label={t("admin.closeMenu")}
          >
            <AppIcon icon={X} size="md" />
          </button>
        </div>
        <nav className="admin-thin-scroll min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain">
          {NAV_KEYS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={closeMobile}
              className={cn(
                "block rounded-xl px-3 py-2.5 text-sm transition-colors",
                pathname === item.href
                  ? "bg-[#6b8f71]/15 font-medium text-[#527559]"
                  : "text-[#71717a] hover:bg-[#f4f4f5]",
              )}
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-8 shrink-0 border-[#e4e4e7] text-[#71717a]"
          loading={isPending}
          loadingLabel={t("common.processing")}
          onClick={() =>
            runAction(() => signOutAction(), {
              onSuccess: () => {
                clearSession();
                router.push("/login");
                router.refresh();
              },
            })
          }
        >
          {t("admin.signOut")}
        </Button>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header className="shrink-0 border-b border-[#e4e4e7] bg-white px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" className="md:hidden" onClick={toggleMobile} aria-label={t("admin.menu")}>
                <AppIcon icon={Menu} size="md" />
              </button>
              <div>
                <h1 className="text-lg font-bold text-[#18181b]">{title}</h1>
                {subtitle && <p className="text-sm text-[#71717a]">{subtitle}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <PriceVisibilityToggle compact />
              <LanguageTabs
                compact
                className="border-[#e4e4e7] bg-[#fafafa] [&_button[aria-selected=true]]:bg-[#6b8f71] [&_button[aria-selected=true]]:text-white"
              />
            </div>
          </div>
        </header>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4 md:p-8">
          <div
            className="admin-page-scroll admin-thin-scroll"
            style={{
              flex: "1 1 0%",
              minHeight: 0,
              height: 0,
              overflowX: "hidden",
              overflowY: "auto",
              overscrollBehavior: "contain",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
