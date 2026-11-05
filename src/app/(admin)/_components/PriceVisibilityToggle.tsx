"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { setShowPricesAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Switch } from "@/components/ui/Switch";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  compact?: boolean;
};

export function PriceVisibilityToggle({ className, compact }: Props) {
  const { showPrices, isReady } = useStoreSettings();
  const isLoading = !isReady;
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
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {!compact && (
        <div className="text-sm">
          <p className="font-medium text-foreground">{t("admin.priceToggle.title")}</p>
          <p className="text-xs text-muted">
            {showPrices ? t("admin.priceToggle.onDesc") : t("admin.priceToggle.offDesc")}
          </p>
        </div>
      )}
      <Switch
        checked={showPrices}
        onChange={() => toggle()}
        label={t("admin.priceToggle.title")}
        disabled={isLoading || isPending}
      />
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
