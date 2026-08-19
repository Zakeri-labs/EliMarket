"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User } from "lucide-react";
import { adminSignInAction } from "@/app/_actions/auth-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { LanguageTabs } from "@/components/i18n/LanguageTabs";
import { BRAND_NAME } from "@/config/brand";
import { ADMIN_EMAIL_DOMAIN } from "@/config/admin-auth";

const inputClass =
  "w-full rounded-xl border border-[#e4e4e7] px-4 py-3 text-sm outline-none focus:border-[#6b8f71]";

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const updateSession = useAuthStore((s) => s.updateSession);
  const { isPending, runAction } = useFormAction();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const forbidden = searchParams.get("error") === "forbidden";

  return (
    <>
      {forbidden && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          حساب شما دسترسی ادمین ندارد.
        </p>
      )}

      <div className="rounded-2xl border border-[#e4e4e7] bg-white p-6 shadow-sm">
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            runAction(() => adminSignInAction({ username, password }), {
              successMessage: "ورود موفق",
              onSuccess: async () => {
                await updateSession();
                router.push("/dashboard");
                router.refresh();
              },
            });
          }}
        >
          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs text-[#71717a]">
              <AppIcon icon={User} size="xs" />
              نام کاربری
            </label>
            <input
              className={inputClass}
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              dir="ltr"
              autoComplete="username"
              required
            />
            <p className="mt-1 text-[10px] text-[#71717a]">
              بدون @ → {`username@${ADMIN_EMAIL_DOMAIN}`}
            </p>
          </div>

          <div>
            <label className="mb-1.5 flex items-center gap-2 text-xs text-[#71717a]">
              <AppIcon icon={Lock} size="xs" />
              رمز عبور
            </label>
            <input
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              dir="ltr"
              autoComplete="current-password"
              required
            />
          </div>

          <Button
            type="submit"
            fullWidth
            disabled={isPending}
            className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
          >
            ورود
          </Button>
        </form>
      </div>
    </>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div className="flex justify-center">
        <LanguageTabs className="border-[#e4e4e7] bg-white [&_button[aria-selected=true]]:bg-[#6b8f71] [&_button[aria-selected=true]]:text-white" />
      </div>

      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#527559]">{BRAND_NAME}</h1>
        <p className="mt-2 text-sm text-[#71717a]">ورود پنل مدیریت</p>
      </div>

      <Suspense fallback={<div className="h-48 rounded-2xl bg-white/50" />}>
        <AdminLoginForm />
      </Suspense>
    </main>
  );
}
