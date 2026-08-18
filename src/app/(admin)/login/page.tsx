"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { sendOtpAction, verifyOtpAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";

export default function AdminLoginPage() {
  const router = useRouter();
  const updateSession = useAuthStore((s) => s.updateSession);
  const { isPending, runAction } = useFormAction();
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-bold">ورود ادمین</h1>
        <p className="mt-1 text-sm text-zinc-500">ورود با شماره موبایل و کد یکبار مصرف</p>
      </div>

      {step === "phone" ? (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            runAction(() => sendOtpAction({ phone }), {
              successMessage: "کد ارسال شد",
              onSuccess: () => setStep("code"),
            });
          }}
        >
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="۰۹۱۲۳۴۵۶۷۸۹"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            dir="ltr"
            required
          />
          <Button type="submit" disabled={isPending}>دریافت کد</Button>
        </form>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            runAction(() => verifyOtpAction({ phone, token: otp }), {
              successMessage: "ورود موفق",
              onSuccess: async () => {
                await updateSession();
                router.push("/dashboard");
                router.refresh();
              },
            });
          }}
        >
          <input
            className="w-full rounded-md border px-3 py-2"
            placeholder="کد ۶ رقمی"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            dir="ltr"
            required
          />
          <Button type="submit" disabled={isPending}>تأیید و ورود</Button>
          <Button type="button" variant="secondary" onClick={() => setStep("phone")}>
            تغییر شماره
          </Button>
        </form>
      )}
    </main>
  );
}
