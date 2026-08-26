"use client";

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

export function RiderShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const clearSession = useAuthStore((s) => s.clearSession);
  const session = useAuthStore((s) => s.session);
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-xs text-muted">{t("rider.panelLabel")}</p>
            <h1 className="truncate text-lg font-bold">{title}</h1>
            {session?.fullName || session?.phone ? (
              <p className="truncate text-xs text-muted" dir="ltr">
                {session.fullName || session.phone}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <LanguageTabs compact />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isPending}
              loadingLabel={t("common.processing")}
              onClick={() =>
                runAction(() => signOutAction(), {
                  onSuccess: () => {
                    clearSession();
                    router.push("/rider/login");
                    router.refresh();
                  },
                })
              }
            >
              <AppIcon icon={LogOut} size="xs" />
            </Button>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-3xl gap-1 px-4 pb-3">
          <Link
            href="/rider"
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
              pathname === "/rider"
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface text-muted",
            )}
          >
            <AppIcon icon={Bike} size="sm" />
            {t("rider.nav.orders")}
          </Link>
          <Link
            href="/rider/finance"
            className={cn(
              "inline-flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium",
              pathname.startsWith("/rider/finance")
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface text-muted",
            )}
          >
            <AppIcon icon={Wallet} size="sm" />
            {t("rider.nav.finance")}
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-5">{children}</main>
    </div>
  );
}
