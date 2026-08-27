"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setCashSurchargeAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
};

export function CashSurchargeSetting({ className }: Props) {
  const { cashSurcharge, isLoading } = useStoreSettings();
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const { t, messages } = useTranslations();
  // `null` means "show the persisted value"; a string means the admin is editing.
  const [draft, setDraft] = useState<string | null>(null);
  const value = draft ?? String(cashSurcharge ?? 0);

  const save = () => {
    const amount = Number(value.replace(/,/g, "").trim());
    runAction(() => setCashSurchargeAction(Number.isFinite(amount) ? amount : 0), {
      successMessage: t("notifications.cashSurchargeSaved"),
      onSuccess: () => {
        setDraft(null);
        void queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      },
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="text-sm">
        <p className="font-medium text-[#18181b]">{t("admin.cashSurcharge.title")}</p>
        <p className="text-xs text-[#71717a]">{t("admin.cashSurcharge.desc")}</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-[#18181b]">
          <span>{t("admin.cashSurcharge.label")}</span>
          <span className="relative">
            <input
              type="number"
              min={0}
              step="0.001"
              inputMode="decimal"
              dir="ltr"
              value={value}
              onChange={(e) => setDraft(e.target.value)}
              disabled={isLoading}
              className="w-32 rounded-lg border border-[#e4e4e7] px-3 py-2 text-sm outline-none focus:border-[#0f766e]"
            />
          </span>
          <span className="text-xs text-[#71717a]">{messages.brand.currency}</span>
        </label>
        <Button
          type="button"
          size="sm"
          loading={isPending}
          loadingLabel={t("common.saving")}
          disabled={isLoading}
          onClick={save}
        >
          {t("admin.cashSurcharge.save")}
        </Button>
      </div>
    </div>
  );
}
