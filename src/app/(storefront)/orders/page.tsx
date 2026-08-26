"use client";

import Link from "next/link";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { StorefrontBreadcrumbs } from "@/app/(storefront)/_components/StorefrontBreadcrumbs";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getNumberLocale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

export default function OrdersListPage() {
  const { data: orders, isLoading, error } = useOrders();
  const { t } = useTranslations();
  const formatPrice = useFormatPrice();
  const locale = useLocaleStore((s) => s.locale);

  return (
    <main className="w-full py-4 md:py-8">
      <StorefrontBreadcrumbs
        items={[
          { label: t("product.breadcrumbHome"), href: "/" },
          { label: t("orders.title") },
        ]}
      />
      <h1 className="mb-4 text-xl font-bold md:mb-6 md:text-2xl">{t("orders.title")}</h1>
      {isLoading && <p className="text-muted text-sm">{t("orders.loading")}</p>}
      {error && <p className="text-danger text-sm">{error.message}</p>}
      {!isLoading && !orders?.length && (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center md:max-w-xl">
          <p className="text-muted text-sm">{t("orders.empty")}</p>
          <Link href="/" className="mt-3 inline-block text-sm text-accent">
            {t("orders.startShopping")}
          </Link>
        </div>
      )}
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {orders?.map((order) => (
          <li key={order.id}>
            <Link
              href={`/orders/${order.id}`}
              className="block h-full rounded-2xl border border-border bg-surface p-4 transition-colors hover:border-accent-teal/40 md:p-5"
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
    </main>
  );
}
