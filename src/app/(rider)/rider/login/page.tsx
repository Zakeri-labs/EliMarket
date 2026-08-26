"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { sendOtpAction, verifyRiderOtpAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import {
  isOtpBypassEnabledPublic,
  otpBypassCodePublic,
} from "@/config/otp-bypass";
import { useTranslations } from "@/i18n/use-translations";

const otpBypass = isOtpBypassEnabledPublic();
const bypassCode = otpBypassCodePublic();

export default function RiderLoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const updateSession = useAuthStore((s) => s.updateSession);
  const { runAction, isPending } = useFormAction();
  const { t, dir } = useTranslations();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState(otpBypass ? "09121234567" : "");
  const [otp, setOtp] = useState(otpBypass ? bypassCode : "");

  return (
    <main className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center px-4 py-10" dir={dir}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs text-muted">{t("rider.panelLabel")}</p>
          <h1 className="text-2xl font-bold">{t("rider.loginTitle")}</h1>
          <p className="mt-1 text-sm text-muted">{t("rider.loginSubtitle")}</p>
        </div>
        <LanguageTabs compact />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        {step === "phone" ? (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => sendOtpAction({ phone }), {
                successMessage: t("notifications.otpSent"),
                onSuccess: () => setStep("code"),
              });
            }}
          >
            <input
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
              placeholder={t("account.phonePlaceholder")}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              required
            />
            <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
              {t("account.getCode")}
            </Button>
          </form>
        ) : (
          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              runAction(() => verifyRiderOtpAction({ phone, token: otp }), {
                successMessage: t("notifications.loginSuccess"),
                onSuccess: async () => {
                  await updateSession();
                  await queryClient.invalidateQueries();
                  router.replace("/rider");
                  router.refresh();
                },
              });
            }}
          >
            <input
              className="w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
              placeholder={t("account.otpPlaceholder")}
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              dir="ltr"
              required
            />
            {otpBypass && (
              <p className="text-xs text-muted" dir="ltr">
                Temporary OTP — any phone, code: <strong>{bypassCode}</strong>
              </p>
            )}
            <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
              {t("account.confirm")}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted"
              onClick={() => setStep("phone")}
            >
              {t("common.back")}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
