"use client";

import { useQueryClient } from "@tanstack/react-query";
import { setShowProductDetailExtrasAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Switch } from "@/components/ui/Switch";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ProductDetailExtrasToggle({ className, compact }: Props) {
  const { showProductDetailExtras, isReady } = useStoreSettings();
  const isLoading = !isReady;
  const { runAction, isPending } = useFormAction();
  const queryClient = useQueryClient();
  const { t } = useTranslations();

  const toggle = () => {
    runAction(() => setShowProductDetailExtrasAction(!showProductDetailExtras), {
      successMessage: showProductDetailExtras
        ? t("notifications.productExtrasHidden")
        : t("notifications.productExtrasShown"),
      onSuccess: () => {
        void queryClient.invalidateQueries({ queryKey: ["store-settings"] });
      },
    });
  };

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      {!compact && (
        <div className="text-sm">
          <p className="font-medium text-foreground">{t("admin.productExtrasToggle.title")}</p>
          <p className="text-xs text-muted">
            {showProductDetailExtras
              ? t("admin.productExtrasToggle.onDesc")
              : t("admin.productExtrasToggle.offDesc")}
          </p>
        </div>
      )}
      <Switch
        checked={showProductDetailExtras}
        onChange={() => toggle()}
        label={t("admin.productExtrasToggle.title")}
        disabled={isLoading || isPending}
      />
    </div>
  );
}
