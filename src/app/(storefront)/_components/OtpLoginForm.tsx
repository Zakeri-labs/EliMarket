"use client";

import { useEffect, useState } from "react";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

// Must match OTP_RESEND_COOLDOWN_SECONDS in src/lib/otp/otp-store.ts so the
// resend button unlocks exactly when the server will accept a new request.
const RESEND_COOLDOWN_SECONDS = 120;

const DEFAULT_INPUT_CLASS =
  "w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 outline-none focus:border-accent md:py-3.5";

interface OtpLoginFormProps {
  /** i18n namespace holding phonePlaceholder/getCode/otpPlaceholder/confirm/resendCode/resendIn/changeNumber. */
  ns: "account" | "checkout";
  inputClassName?: string;
  onVerified: () => void | Promise<void>;
}

export function OtpLoginForm({ ns, inputClassName, onVerified }: OtpLoginFormProps) {
  const { t } = useTranslations();
  const { runAction, isPending } = useFormAction();
  const [otpStep, setOtpStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(0);

  useEffect(() => {
    if (otpStep !== "code" || secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [otpStep, secondsLeft]);

  const inputClass = inputClassName ?? DEFAULT_INPUT_CLASS;

  const requestCode = () => {
    runAction(() => sendOtpAction({ phone }), {
      successMessage: t("notifications.otpSent"),
      onSuccess: () => {
        setOtpStep("code");
        setSecondsLeft(RESEND_COOLDOWN_SECONDS);
      },
    });
  };

  if (otpStep === "phone") {
    return (
      <form
        className="space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          requestCode();
        }}
      >
        <input
          className={inputClass}
          placeholder={t(`${ns}.phonePlaceholder`)}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
        />
        <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
          {t(`${ns}.getCode`)}
        </Button>
      </form>
    );
  }

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        runAction(() => verifyOtpAction({ phone, token: otp }), {
          successMessage: t("notifications.loginSuccess"),
          onSuccess: async () => {
            await onVerified();
            setOtpStep("phone");
            setOtp("");
          },
        });
      }}
    >
      <p className="text-sm text-muted" dir="ltr">
        {phone}
      </p>
      <input
        className={inputClass}
        placeholder={t(`${ns}.otpPlaceholder`)}
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        dir="ltr"
      />
      <Button type="submit" fullWidth loading={isPending} loadingLabel={t("common.processing")}>
        {t(`${ns}.confirm`)}
      </Button>
      <div className="flex items-center justify-between text-xs">
        <button
          type="button"
          className="text-accent underline disabled:cursor-not-allowed disabled:text-muted disabled:no-underline"
          disabled={secondsLeft > 0 || isPending}
          onClick={requestCode}
        >
          {secondsLeft > 0
            ? t(`${ns}.resendIn`, { seconds: secondsLeft })
            : t(`${ns}.resendCode`)}
        </button>
        <button
          type="button"
          className="text-muted underline"
          disabled={isPending}
          onClick={() => {
            setOtpStep("phone");
            setOtp("");
            setSecondsLeft(0);
          }}
        >
          {t(`${ns}.changeNumber`)}
        </button>
      </div>
    </form>
  );
}
