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

const NAV = [
  { href: "/dashboard", label: "داشبورد" },
  { href: "/dashboard/products", label: "محصولات" },
  { href: "/dashboard/orders", label: "سفارش‌ها" },
  { href: "/dashboard/reports", label: "گزارشات مالی" },
  { href: "/dashboard/coverage-area", label: "محدوده پوشش" },
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

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  const closeMobile = () => setMobileOpen(false);

  return (
    <div className="flex min-h-full flex-1">
      {mobileOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={closeMobile}
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 start-0 z-40 w-64 shrink-0 border-e border-[#e4e4e7] bg-white p-5 shadow-lg transition-transform md:static md:translate-x-0 md:shadow-none",
          mobileOpen
            ? "translate-x-0"
            : "max-md:-translate-x-full max-md:rtl:translate-x-full",
        )}
      >
        <div className="mb-6 flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-[#6b8f71]">پنل مدیریت</p>
            <p className="text-lg font-bold text-[#527559]">EliMarket Admin</p>
          </div>
          <button
            type="button"
            className="rounded-lg p-1.5 text-[#71717a] hover:bg-[#f4f4f5] md:hidden"
            onClick={closeMobile}
            aria-label="بستن منو"
          >
            <AppIcon icon={X} size="md" />
          </button>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => (
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
              {item.label}
            </Link>
          ))}
        </nav>
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-8 border-[#e4e4e7] text-[#71717a]"
          disabled={isPending}
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
          خروج
        </Button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-[#e4e4e7] bg-white px-4 py-4 md:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button type="button" className="md:hidden" onClick={toggleMobile} aria-label="Menu">
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
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
