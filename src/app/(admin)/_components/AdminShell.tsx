"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  LayoutDashboard,
  Package,
  Sparkles,
  FolderTree,
  Tag,
  Image as ImageIcon,
  Percent,
  ClipboardList,
  MapPin,
  BarChart3,
  Users,
  Star,
  MessageCircleQuestion,
  Bike,
  type LucideIcon,
} from "lucide-react";
import { signOutAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useUiStore } from "@/app/_store/ui-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";
import { ProductDetailExtrasToggle } from "@/app/(admin)/_components/ProductDetailExtrasToggle";
import { AdminNotificationBell } from "@/app/(admin)/_components/AdminNotificationBell";
import { AppIcon } from "@/components/icons/AppIcon";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type NavItem = { href: string; key: string; icon: LucideIcon };
type NavGroup = { groupKey: string; items: NavItem[] };

const NAV_GROUPS: NavGroup[] = [
  {
    groupKey: "admin.navGroups.overview",
    items: [{ href: "/dashboard", key: "admin.nav.dashboard", icon: LayoutDashboard }],
  },
  {
    groupKey: "admin.navGroups.catalog",
    items: [
      { href: "/dashboard/products", key: "admin.nav.products", icon: Package },
      { href: "/dashboard/products/smart", key: "admin.nav.smartProduct", icon: Sparkles },
      { href: "/dashboard/categories", key: "admin.nav.categories", icon: FolderTree },
      { href: "/dashboard/brands", key: "admin.nav.brands", icon: Tag },
      { href: "/dashboard/reviews", key: "admin.nav.reviews", icon: Star },
      { href: "/dashboard/questions", key: "admin.nav.questions", icon: MessageCircleQuestion },
    ],
  },
  {
    groupKey: "admin.navGroups.marketing",
    items: [
      { href: "/dashboard/banners", key: "admin.nav.banners", icon: ImageIcon },
      { href: "/dashboard/campaigns", key: "admin.nav.campaigns", icon: Percent },
    ],
  },
  {
    groupKey: "admin.navGroups.operations",
    items: [
      { href: "/dashboard/orders", key: "admin.nav.orders", icon: ClipboardList },
      { href: "/dashboard/riders", key: "admin.nav.riders", icon: Bike },
      { href: "/dashboard/coverage-area", key: "admin.nav.coverage", icon: MapPin },
    ],
  },
  {
    groupKey: "admin.navGroups.insights",
    items: [
      { href: "/dashboard/reports", key: "admin.nav.reports", icon: BarChart3 },
      { href: "/dashboard/customers", key: "admin.nav.customers", icon: Users },
    ],
  },
];

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
            <p className="font-logo text-lg font-semibold tracking-wide text-[#527559]">
              {t("admin.brandAdmin")}
            </p>
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
        <nav className="admin-thin-scroll min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain">
          {NAV_GROUPS.map((group) => (
            <div key={group.groupKey} className="space-y-1">
              <p className="px-3 text-[11px] font-semibold uppercase tracking-wide text-[#a1a1aa]">
                {t(group.groupKey)}
              </p>
              {group.items.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMobile}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors",
                      active
                        ? "bg-[#6b8f71]/15 font-medium text-[#527559]"
                        : "text-[#71717a] hover:bg-[#f4f4f5]",
                    )}
                  >
                    <AppIcon
                      icon={item.icon}
                      size="sm"
                      className={active ? "text-[#527559]" : "text-[#a1a1aa]"}
                    />
                    {t(item.key)}
                  </Link>
                );
              })}
            </div>
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
              <AdminNotificationBell />
              <PriceVisibilityToggle compact />
              <ProductDetailExtrasToggle compact />
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
