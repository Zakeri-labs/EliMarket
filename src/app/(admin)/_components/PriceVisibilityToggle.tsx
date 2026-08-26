"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setShowPricesAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  compact?: boolean;
};

export function PriceVisibilityToggle({ className, compact }: Props) {
  const { showPrices, isLoading } = useStoreSettings();
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const { t } = useTranslations();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const applyToggle = () => {
    runAction(() => setShowPricesAction(!showPrices), {
      successMessage: showPrices
        ? t("notifications.priceDisabled")
        : t("notifications.priceEnabled"),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      },
    });
  };

  // Turning prices ON is low-risk and instant. Turning them OFF hides
  // prices storewide and disables the cart for every customer, so that
  // direction gets a confirmation step to guard against an accidental click.
  const toggle = () => {
    if (showPrices) {
      setConfirmOpen(true);
    } else {
      applyToggle();
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {!compact && (
        <div className="text-sm">
          <p className="font-medium text-[#18181b]">{t("admin.priceToggle.title")}</p>
          <p className="text-xs text-[#71717a]">
            {showPrices ? t("admin.priceToggle.onDesc") : t("admin.priceToggle.offDesc")}
          </p>
        </div>
      )}
      <Button
        type="button"
        variant={showPrices ? "secondary" : "primary"}
        size={compact ? "sm" : "md"}
        disabled={isLoading}
        loading={isPending}
        loadingLabel={t("common.saving")}
        onClick={toggle}
        className={cn(
          !showPrices && "bg-[#0f766e] text-white hover:opacity-90",
          showPrices && "border-[#e4e4e7]",
        )}
      >
        {isLoading
          ? "…"
          : showPrices
            ? t("admin.priceToggle.on")
            : t("admin.priceToggle.off")}
      </Button>
      <ConfirmDialog
        open={confirmOpen}
        title={t("admin.priceToggle.confirmOffTitle")}
        description={t("admin.priceToggle.confirmOffDesc")}
        confirmLabel={t("admin.priceToggle.confirmOffAction")}
        cancelLabel={t("common.cancel")}
        onOpenChange={setConfirmOpen}
        onConfirm={applyToggle}
      />
    </div>
  );
}
