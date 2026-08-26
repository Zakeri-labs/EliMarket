"use client";

import { useQueryClient } from "@tanstack/react-query";
import { setShowProductDetailExtrasAction } from "@/app/_actions/settings-actions";
import { useStoreSettings } from "@/app/_hooks/use-store-settings";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ProductDetailExtrasToggle({ className, compact }: Props) {
  const { showProductDetailExtras, isLoading } = useStoreSettings();
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
    <div className={cn("flex items-center gap-3", className)}>
      {!compact && (
        <div className="text-sm">
          <p className="font-medium text-[#18181b]">{t("admin.productExtrasToggle.title")}</p>
          <p className="text-xs text-[#71717a]">
            {showProductDetailExtras
              ? t("admin.productExtrasToggle.onDesc")
              : t("admin.productExtrasToggle.offDesc")}
          </p>
        </div>
      )}
      <Button
        type="button"
        variant={showProductDetailExtras ? "secondary" : "primary"}
        size={compact ? "sm" : "md"}
        disabled={isLoading}
        loading={isPending}
        loadingLabel={t("common.saving")}
        onClick={toggle}
        className={cn(
          !showProductDetailExtras && "bg-[#527559] text-white hover:opacity-90",
          showProductDetailExtras && "border-[#e4e4e7]",
        )}
        title={t("admin.productExtrasToggle.title")}
      >
        {isLoading
          ? "…"
          : showProductDetailExtras
            ? t("admin.productExtrasToggle.on")
            : t("admin.productExtrasToggle.off")}
      </Button>
    </div>
  );
}
