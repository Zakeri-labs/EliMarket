"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  ClipboardList,
  Heart,
  MapPin,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/app/_store/auth-store";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { useAddresses } from "@/app/(storefront)/_hooks/use-addresses";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { AccountAddressesPanel } from "@/app/(storefront)/account/_components/AccountAddressesPanel";
import { AccountAvatarEditor } from "@/app/(storefront)/account/_components/AccountAvatarEditor";
import { AccountFavouritesPanel } from "@/app/(storefront)/account/_components/AccountFavouritesPanel";
import { AccountOrdersPanel } from "@/app/(storefront)/account/_components/AccountOrdersPanel";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { sendOtpAction, signOutAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";

type AccountSection = "orders" | "addresses" | "favourites";

function parseSection(value: string | null): AccountSection {
  if (value === "addresses" || value === "favourites" || value === "orders") return value;
  return "orders";
}

function SideNavButton({
  icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  value?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-start text-sm transition-colors md:gap-4 md:px-5 md:py-4 md:text-[15px]",
        active
          ? "border-accent/50 bg-accent/10 text-accent"
          : "border-border bg-surface text-foreground hover:border-accent/40",
      )}
    >
      <span
        className={cn(
          "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl md:h-11 md:w-11",
          active ? "bg-accent/20" : "bg-accent/15",
        )}
      >
        <AppIcon icon={icon} size="sm" className={active ? "text-accent" : "text-accent"} />
      </span>
      <span className="flex-1 font-medium">{label}</span>
      {value ? <span className="shrink-0 text-xs opacity-80 md:text-sm">{value}</span> : null}
      <AppIcon
        icon={ChevronRight}
        size="sm"
        className={cn("shrink-0 rtl:rotate-180", active ? "text-accent" : "text-muted")}
      />
    </button>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const queryClient = useQueryClient();
  const { session, status, updateSession, clearSession } = useAuthStore();
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  const section = parseSection(searchParams.get("section"));

  const setSection = (next: AccountSection) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("next");
    if (next === "orders") params.delete("section");
    else params.set("section", next);
    const qs = params.toString();
    router.replace(qs ? `/account?${qs}` : "/account", { scroll: false });
  };

  useEffect(() => {
    if (status === "authenticated" && session && nextPath) {
      router.replace(nextPath);
    }
  }, [status, session, nextPath, router]);

  const { data: orders } = useOrders();
  const { data: addresses } = useAddresses();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const defaultAddress = addresses?.find((a) => a.is_default) ?? addresses?.[0];
  const isAdmin = session?.role === "admin";

  const crumbs = useMemo(() => {
    const base = [
      { label: t("product.breadcrumbHome"), href: "/" },
      { label: t("account.title"), href: "/account" },
    ];
    if (section === "orders") return [...base, { label: t("account.myOrders") }];
    if (section === "addresses") return [...base, { label: t("account.deliveryAddresses") }];
    return [...base, { label: t("account.favourites") }];
  }, [section, t]);

  if (status === "authenticated" && session) {
    return (
      <main className="w-full py-4 md:py-8">
        <StorefrontBreadcrumbs items={crumbs} />
        <h1 className="mb-5 text-xl font-bold md:mb-8 md:text-2xl">{t("account.title")}</h1>

        <div className="space-y-4 md:grid md:grid-cols-[minmax(280px,360px)_minmax(0,1fr)] md:items-start md:gap-8 md:space-y-0 lg:grid-cols-[minmax(300px,380px)_minmax(0,1fr)] lg:gap-12">
          <aside className="space-y-3 md:sticky md:top-24 md:space-y-4">
            <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 md:flex-col md:items-start md:gap-5 md:rounded-3xl md:p-6">
              <AccountAvatarEditor />
              <div className="min-w-0 flex-1 md:w-full">
                <p className="truncate text-base font-semibold md:text-lg">
                  {session.fullName ?? t("account.defaultUser")}
                </p>
                {session.phone ? (
                  <p className="mt-0.5 text-sm text-muted" dir="ltr">
                    {session.phone}
                  </p>
                ) : null}
              </div>
            </div>

            <nav className="space-y-2" aria-label={t("account.title")}>
              <SideNavButton
                icon={ClipboardList}
                label={t("account.myOrders")}
                value={orders?.length ? String(orders.length) : undefined}
                active={section === "orders"}
                onClick={() => setSection("orders")}
              />
              <SideNavButton
                icon={MapPin}
                label={t("account.deliveryAddresses")}
                value={defaultAddress?.label}
                active={section === "addresses"}
                onClick={() => setSection("addresses")}
              />
              <SideNavButton
                icon={Heart}
                label={t("account.favourites")}
                value={wishlistCount ? String(wishlistCount) : undefined}
                active={section === "favourites"}
                onClick={() => setSection("favourites")}
              />
            </nav>

            {isAdmin ? (
              <Link
                href="/dashboard"
                className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3.5 text-sm font-medium text-accent md:gap-4 md:px-5 md:py-4 md:text-[15px]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/20 md:h-11 md:w-11">
                  <AppIcon icon={Settings} size="sm" />
                </span>
                <span className="flex-1">{t("account.adminPanel")}</span>
                <AppIcon icon={ChevronRight} size="sm" className="rtl:rotate-180" />
              </Link>
            ) : null}

            <div className="flex flex-col gap-2">
              <ThemeToggle className="w-full justify-center" />
              <LanguageTabs className="w-full" />
            </div>

            <Button
              type="button"
              variant="outline"
              fullWidth
              loading={isPending}
              loadingLabel={t("common.processing")}
              onClick={() =>
                runAction(() => signOutAction(), {
                  onSuccess: () => clearSession(),
                })
              }
            >
              {t("account.signOut")}
            </Button>
          </aside>

          <section className="min-w-0 rounded-2xl border border-border bg-surface/40 p-4 md:rounded-3xl md:p-6 lg:p-8">
            {section === "orders" ? <AccountOrdersPanel /> : null}
            {section === "addresses" ? <AccountAddressesPanel /> : null}
            {section === "favourites" ? <AccountFavouritesPanel /> : null}
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full py-4 md:py-8">
      <StorefrontBreadcrumbs
        items={[
          { label: t("product.breadcrumbHome"), href: "/" },
          { label: t("account.loginTitle") },
        ]}
      />
      <div className="md:mx-auto md:max-w-lg">
        <h1 className="mb-2 text-xl font-bold md:text-2xl">{t("account.loginTitle")}</h1>
        <p className="mb-6 text-sm text-muted md:text-[15px]">
          {nextPath ? t("account.signInToContinue") : t("account.loginSubtitle")}
        </p>
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <ThemeToggle />
          <LanguageTabs />
        </div>
        <div className="rounded-2xl border border-border bg-surface p-4 md:rounded-3xl md:p-6">
          {otpStep === "phone" ? (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                runAction(() => sendOtpAction({ phone }), {
                  successMessage: t("notifications.otpSent"),
                  onSuccess: () => setOtpStep("code"),
                });
              }}
            >
              <input
                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-accent md:py-3.5"
                placeholder={t("account.phonePlaceholder")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
              />
              <Button
                type="submit"
                fullWidth
                loading={isPending}
                loadingLabel={t("common.processing")}
              >
                {t("account.getCode")}
              </Button>
            </form>
          ) : (
            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                runAction(() => verifyOtpAction({ phone, token: otp }), {
                  successMessage: t("notifications.loginSuccess"),
                  onSuccess: async () => {
                    await updateSession();
                    await queryClient.invalidateQueries({ queryKey: ["addresses"] });
                    setOtpStep("phone");
                  },
                });
              }}
            >
              <input
                className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-accent md:py-3.5"
                placeholder={t("account.otpPlaceholder")}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                dir="ltr"
              />
              {process.env.NEXT_PUBLIC_OTP_BYPASS_ENABLED !== "false" && (
                <p className="text-xs text-muted" dir="ltr">
                  Temporary OTP — any phone, code:{" "}
                  <strong>{process.env.NEXT_PUBLIC_OTP_BYPASS_CODE || "213141"}</strong>
                </p>
              )}
              <Button
                type="submit"
                fullWidth
                loading={isPending}
                loadingLabel={t("common.processing")}
              >
                {t("account.confirm")}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  );
}
