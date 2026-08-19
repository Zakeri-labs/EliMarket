"use client";

import Link from "next/link";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getNumberLocale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export default function OrdersListPage() {
  const { data: orders, isLoading, error } = useOrders();
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <main className="py-4 md:py-6">
      <h1 className="mb-4 text-xl font-bold">{t("orders.title")}</h1>
      {isLoading && <p className="text-muted text-sm">{t("orders.loading")}</p>}
      {error && <p className="text-danger text-sm">{error.message}</p>}
      {!isLoading && !orders?.length && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center">
          <p className="text-muted text-sm">{t("orders.empty")}</p>
          <Link href="/" className="mt-3 inline-block text-accent text-sm">{t("orders.startShopping")}</Link>
        </div>
      )}
      <ul className="space-y-3">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block rounded-2xl border border-border bg-surface p-4"
            >
              <div className="flex justify-between">
                <span className="text-sm font-medium">#{order.id.slice(0, 8)}</span>
                <span className="text-xs text-accent">
                  {t(`orders.status.${order.status}`) || order.status}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted">
                {new Date(order.created_at).toLocaleDateString(getNumberLocale(locale))}
              </p>
              <p className="mt-2 font-bold text-accent">
                {formatPrice(Number(order.total), order.currency)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
