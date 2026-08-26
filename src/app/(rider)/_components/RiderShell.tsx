"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bike, LogOut, Wallet } from "lucide-react";
import { signOutAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

const NAV = [
  { href: "/rider", key: "rider.nav.orders" as const, icon: Bike, match: (p: string) => p === "/rider" },
  {
    href: "/rider/finance",
    key: "rider.nav.finance" as const,
    icon: Wallet,
    match: (p: string) => p.startsWith("/rider/finance"),
  },
];

export function RiderShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const session = useAuthStore((s) => s.session);
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();

  const logout = () =>
    runAction(() => signOutAction(), {
      onSuccess: () => {
        clearSession();
        router.push("/rider/login");
        router.refresh();
      },
    });

  return (
    <div className="flex min-h-full bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-e border-border bg-surface md:flex">
        <div className="border-b border-border px-5 py-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            {t("rider.panelLabel")}
          </p>
          {(session?.fullName || session?.phone) && (
            <p className="mt-2 truncate text-sm font-medium" dir="ltr">
              {session.fullName || session.phone}
            </p>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = item.match(pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "inline-flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent/15 text-accent"
                    : "text-muted hover:bg-surface-elevated hover:text-foreground",
                )}
              >
                <AppIcon icon={item.icon} size="sm" />
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-3 border-t border-border p-3">
          <LanguageTabs compact />
          <Button
            type="button"
            variant="outline"
            size="sm"
            fullWidth
            loading={isPending}
            loadingLabel={t("common.processing")}
            onClick={logout}
          >
            <AppIcon icon={LogOut} size="xs" />
            {t("account.signOut")}
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3 px-4 py-3 md:px-6">
            <div className="min-w-0">
              <p className="text-xs text-muted md:hidden">{t("rider.panelLabel")}</p>
              <h1 className="truncate text-lg font-bold">{title}</h1>
              {(session?.fullName || session?.phone) && (
                <p className="truncate text-xs text-muted md:hidden" dir="ltr">
                  {session.fullName || session.phone}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 md:hidden">
              <LanguageTabs compact />
              <Button
                type="button"
                variant="outline"
                size="sm"
                loading={isPending}
                loadingLabel={t("common.processing")}
                onClick={logout}
              >
                <AppIcon icon={LogOut} size="xs" />
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-5 pb-24 md:px-6 md:pb-8">{children}</main>

        {/* Mobile bottom nav — thumb-friendly for riders on the road */}
        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-2 gap-1 px-2 py-2">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-xs font-medium",
                    active ? "bg-accent/15 text-accent" : "text-muted",
                  )}
                >
                  <AppIcon icon={item.icon} size="sm" />
                  {t(item.key)}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
