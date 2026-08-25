"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ChevronRight,
  ClipboardList,
  Heart,
  MapPin,
  Settings,
  User,
} from "lucide-react";
import { useAuthStore } from "@/app/_store/auth-store";
import { useWishlistStore } from "@/app/_store/wishlist-store";
import { useAddresses } from "@/app/(storefront)/_hooks/use-addresses";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { sendOtpAction, signOutAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { useTranslations } from "@/i18n/use-translations";

function AccountRow({
  href,
  icon,
  label,
  value,
}: {
  href: string;
  icon: LucideIcon;
  label: string;
  value?: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm"
    >
      <AppIcon icon={icon} size="sm" className="shrink-0 text-accent" />
      <span className="flex-1">{label}</span>
      {value && <span className="shrink-0 text-xs text-muted">{value}</span>}
      <AppIcon icon={ChevronRight} size="sm" className="shrink-0 text-muted rtl:rotate-180" />
    </Link>
  );
}

function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const { session, status, updateSession, clearSession } = useAuthStore();
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (status === "authenticated" && session && nextPath) {
      router.replace(nextPath);
    }
  }, [status, session, nextPath, router]);

  const { data: orders } = useOrders();
  const { data: addresses } = useAddresses();
  const wishlistCount = useWishlistStore((s) => s.items.length);
  const defaultAddress = addresses?.find((a) => a.is_default) ?? addresses?.[0];

  if (status === "authenticated" && session) {
    return (
      <main className="py-4 md:mx-auto md:max-w-md md:py-6">
        <h1 className="mb-6 text-xl font-bold">{t("account.title")}</h1>

        <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface p-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent/20">
            <AppIcon icon={User} size="lg" className="text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{session.fullName ?? t("account.defaultUser")}</p>
            <p className="text-sm text-muted" dir="ltr">{session.phone}</p>
            {session.role && <p className="mt-0.5 text-xs text-accent">{session.role}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Link href="/orders" className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-lg font-bold text-accent">{orders?.length ?? 0}</p>
            <p className="mt-0.5 text-xs text-muted">{t("account.ordersLabel")}</p>
          </Link>
          <Link href="/addresses" className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-lg font-bold text-accent">{addresses?.length ?? 0}</p>
            <p className="mt-0.5 text-xs text-muted">{t("account.addressesLabel")}</p>
          </Link>
          <Link href="/favourites" className="rounded-2xl border border-border bg-surface p-3 text-center">
            <p className="text-lg font-bold text-accent">{wishlistCount}</p>
            <p className="mt-0.5 text-xs text-muted">{t("account.favouritesLabel")}</p>
          </Link>
        </div>

        <div className="mt-4 space-y-2">
          <AccountRow
            href="/orders"
            icon={ClipboardList}
            label={t("account.myOrders")}
            value={orders?.length ? String(orders.length) : undefined}
          />
          <AccountRow
            href="/addresses"
            icon={MapPin}
            label={t("account.deliveryAddresses")}
            value={defaultAddress?.label}
          />
          <AccountRow
            href="/favourites"
            icon={Heart}
            label={t("account.favourites")}
            value={wishlistCount ? String(wishlistCount) : undefined}
          />
          {session.role === "admin" && (
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent"
            >
              <AppIcon icon={Settings} size="sm" />
              {t("account.adminPanel")}
            </Link>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <ThemeToggle className="w-full justify-center sm:w-auto" />
          <LanguageTabs className="w-full sm:w-auto" />
        </div>

        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-6"
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
      </main>
    );
  }

  return (
    <main className="py-4 md:mx-auto md:max-w-md md:py-6">
      <h1 className="mb-2 text-xl font-bold">{t("account.loginTitle")}</h1>
      <p className="mb-6 text-sm text-muted">
        {nextPath ? t("account.signInToContinue") : t("account.loginSubtitle")}
      </p>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <ThemeToggle />
        <LanguageTabs />
      </div>
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
            className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-accent"
            placeholder={t("account.phonePlaceholder")}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
          />
          <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>{t("account.getCode")}</Button>
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
                setOtpStep("phone");
              },
            });
          }}
        >
          <input
            className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-accent"
            placeholder={t("account.otpPlaceholder")}
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            dir="ltr"
          />
          {process.env.NODE_ENV !== "production" && (
            <p className="text-xs text-muted" dir="ltr">
              Dev/test mode — no SMS is sent yet. Use code: <strong>123456</strong>
            </p>
          )}
          <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>{t("account.confirm")}</Button>
        </form>
      )}
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
