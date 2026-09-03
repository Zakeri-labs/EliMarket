"use client";

import { useQuery } from "@tanstack/react-query";
import { getRiderFinanceAction } from "@/app/_actions/rider-actions";
import { RiderShell } from "@/app/(rider)/_components/RiderShell";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";

export default function RiderFinancePage() {
  const { t } = useTranslations();

  const query = useQuery({
    queryKey: ["rider-finance"],
    queryFn: async () => {
      const result = await getRiderFinanceAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const data = query.data;

  const cards = [
    {
      label: t("rider.finance.deliveredCount"),
      value: String(data?.deliveredCount ?? 0),
    },
    {
      label: t("rider.finance.totalSales"),
      value: <Price amount={data?.totalSales ?? 0} currency={data?.currency} />,
    },
    {
      label: t("rider.finance.deliveryFees"),
      value: <Price amount={data?.deliveryFees ?? 0} currency={data?.currency} />,
    },
    {
      label: t("rider.finance.cashCollected"),
      value: <Price amount={data?.cashCollected ?? 0} currency={data?.currency} />,
    },
  ];

  return (
    <RiderShell title={t("rider.financeTitle")}>
      {query.isLoading ? (
        <p className="text-sm text-muted">{t("common.loading")}</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-border bg-surface p-4"
            >
              <p className="text-xs text-muted">{card.label}</p>
              <p className="mt-2 text-2xl font-bold text-accent">{card.value}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-4 text-xs text-muted">{t("rider.finance.hint")}</p>
    </RiderShell>
  );
}
