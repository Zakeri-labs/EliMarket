"use client";

import Link from "next/link";
import { ClipboardList, Settings, User } from "lucide-react";
import { useAuthStore } from "@/app/_store/auth-store";
import { sendOtpAction, signOutAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useState } from "react";
import { useTranslations } from "@/i18n/use-translations";

export default function AccountPage() {
  const { session, status, updateSession, clearSession } = useAuthStore();
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  if (status === "authenticated" && session) {
    return (
      <main className="py-4 md:py-6">
        <h1 className="mb-6 text-xl font-bold">{t("account.title")}</h1>
        <div className="rounded-2xl border border-border bg-surface p-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <AppIcon icon={User} size="lg" className="text-accent" />
          </div>
          <p className="mt-4 font-semibold">{session.fullName ?? t("account.defaultUser")}</p>
          <p className="text-sm text-muted" dir="ltr">{session.phone}</p>
          {session.role && (
            <p className="mt-1 text-xs text-accent">{session.role}</p>
          )}
        </div>
        <div className="mt-4 space-y-2">
          <Link href="/orders" className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-sm">
            <AppIcon icon={ClipboardList} size="sm" className="text-accent" />
            {t("account.myOrders")}
          </Link>
          {session.role === "admin" && (
            <Link href="/dashboard" className="flex items-center gap-3 rounded-2xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm text-accent">
              <AppIcon icon={Settings} size="sm" />
              {t("account.adminPanel")}
            </Link>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          fullWidth
          className="mt-6"
          disabled={isPending}
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
    <main className="py-4 md:py-6">
      <h1 className="mb-2 text-xl font-bold">{t("account.loginTitle")}</h1>
      <p className="mb-6 text-sm text-muted">{t("account.loginSubtitle")}</p>
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
          <Button type="submit" fullWidth disabled={isPending}>{t("account.getCode")}</Button>
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
          <Button type="submit" fullWidth disabled={isPending}>{t("account.confirm")}</Button>
        </form>
      )}
    </main>
  );
}
