"use client";

import { useQuery } from "@tanstack/react-query";
import { getRiderFinanceAction } from "@/app/_actions/rider-actions";
import { RiderShell } from "@/app/(rider)/_components/RiderShell";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export default function RiderFinancePage() {
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();

  const query = useQuery({
    queryKey: ["rider-finance"],
    queryFn: async () => {
      const result = await getRiderFinanceAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const data = query.data;

  return (
    <RiderShell title={t("rider.financeTitle")}>
      {query.isLoading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{t("rider.finance.deliveredCount")}</p>
            <p className="mt-2 text-2xl font-bold text-accent">{data?.deliveredCount ?? 0}</p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{t("rider.finance.totalSales")}</p>
            <p className="mt-2 text-2xl font-bold text-accent">
              {formatPrice(data?.totalSales ?? 0, data?.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{t("rider.finance.deliveryFees")}</p>
            <p className="mt-2 text-2xl font-bold text-accent">
              {formatPrice(data?.deliveryFees ?? 0, data?.currency)}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-4">
            <p className="text-xs text-muted">{t("rider.finance.cashCollected")}</p>
            <p className="mt-2 text-2xl font-bold text-accent">
              {formatPrice(data?.cashCollected ?? 0, data?.currency)}
            </p>
          </div>
        </div>
      )}
      <p className="mt-4 text-xs text-muted">{t("rider.finance.hint")}</p>
    </RiderShell>
  );
}
