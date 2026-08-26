"use client";

import Link from "next/link";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getNumberLocale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export function AccountOrdersPanel() {
  const { data: orders, isLoading, error } = useOrders();
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold md:text-xl">{t("account.myOrders")}</h2>
      {isLoading && <p className="text-sm text-muted">{t("orders.loading")}</p>}
      {error && <p className="text-sm text-danger">{error.message}</p>}
      {!isLoading && !orders?.length && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-sm text-muted">{t("orders.empty")}</p>
          <Link href="/" className="mt-3 inline-block text-sm text-accent">
            {t("orders.startShopping")}
          </Link>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block h-full rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent/40 md:p-5"
            >
              <div className="flex justify-between gap-2">
                <span className="text-sm font-medium md:text-[15px]">#{order.id.slice(0, 8)}</span>
                <span className="text-xs text-accent md:text-sm">
                  {t(`orders.status.${order.status}`) || order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted md:text-sm">
                {new Date(order.created_at).toLocaleDateString(getNumberLocale(locale))}
              </p>
              <p className="mt-3 font-bold text-accent md:text-lg">
                {formatPrice(Number(order.total), order.currency)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
