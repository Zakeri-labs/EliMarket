"use client";

import { useMemo, useState } from "react";
import { assignRiderAction, updateOrderStatusAction } from "@/app/_actions/order-actions";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import {
  mockAdminOrderDateLabel,
  mockAdminOrderIdPreview,
  mockAdminOrders,
} from "@/app/(admin)/dashboard/_mocks/order-mock";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { cn } from "@/app/utils/cn";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import type { OrderStatus } from "@/app/_types/database.types";

const STATUS_KEYS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export default function AdminOrdersPage() {
  const { data: orders, isPending, refetch } = useOrders();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { t, locale } = useTranslations();
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});

  const isSkeleton = isPending;
  const list = useMemo(
    () => (isSkeleton ? mockAdminOrders(locale) : (orders ?? [])),
    [isSkeleton, locale, orders],
  );

  return (
    <AdminShell title={t("admin.orders.title")}>
      <div className="space-y-4">
        {list.map((order) => (
          <article
            key={order.id}
            className={cn(
              "rounded-xl border p-4",
              isSkeleton && "skeleton pointer-events-none",
            )}
            aria-busy={isSkeleton}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">
                  {t("admin.orders.orderPrefix")}{" "}
                  {isSkeleton
                    ? mockAdminOrderIdPreview(locale)
                    : `${order.id.slice(0, 8)}…`}
                </p>
                <p className="text-sm text-zinc-500">
                  {isSkeleton
                    ? `${mockAdminOrderDateLabel(locale)} — ${t("admin.orders.status.pending")}`
                    : `${new Date(order.created_at).toLocaleString(getNumberLocale(locale))} — ${t(`admin.orders.status.${order.status}`)}`}
                </p>
                <p className="text-sm">
                  {Number(order.total).toLocaleString(getNumberLocale(locale))}{" "}
                  {order.currency}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded border px-2 py-1 text-sm"
                  value={order.status}
                  disabled={isSkeleton || isActionPending}
                  onChange={(e) => {
                    if (isSkeleton) return;
                    runAction(
                      () => updateOrderStatusAction(order.id, e.target.value as OrderStatus),
                      { onSuccess: () => refetch() },
                    );
                  }}
                >
                  {STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {t(`admin.orders.status.${k}`)}
                    </option>
                  ))}
                </select>
                <input
                  className="w-36 rounded border px-2 py-1 text-sm"
                  placeholder={t("admin.orders.riderPlaceholder")}
                  dir="ltr"
                  disabled={isSkeleton}
                  value={riderIds[order.id] ?? ""}
                  onChange={(e) => setRiderIds((s) => ({ ...s, [order.id]: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isSkeleton || isActionPending || !riderIds[order.id]}
                  onClick={() => {
                    if (isSkeleton) return;
                    runAction(
                      () => assignRiderAction(order.id, riderIds[order.id]),
                      {
                        successMessage: t("notifications.riderAssigned"),
                        onSuccess: () => refetch(),
                      },
                    );
                  }}
                >
                  {t("admin.orders.assignRider")}
                </Button>
              </div>
            </div>
            <ul className="mt-3 space-y-1 text-sm text-zinc-600">
              {order.order_items?.map((item) => (
                <li key={item.id}>
                  {item.product?.name ?? item.product_id} × {item.quantity}
                </li>
              ))}
            </ul>
          </article>
        ))}
        {!isSkeleton && !orders?.length && (
          <p className="text-zinc-500">{t("admin.orders.empty")}</p>
        )}
      </div>
    </AdminShell>
  );
}
