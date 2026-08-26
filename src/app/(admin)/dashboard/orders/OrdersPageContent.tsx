"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  assignRiderAction,
  getRidersAction,
  updateOrderStatusAction,
} from "@/app/_actions/order-actions";
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

export default function OrdersPageContent() {
  const { data: orders, isPending, refetch } = useOrders();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});

  const ridersQuery = useQuery({
    queryKey: ["riders"],
    queryFn: async () => {
      const result = await getRidersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const isSkeleton = isPending;
  const list = useMemo(
    () => (isSkeleton ? mockAdminOrders(locale) : (orders ?? [])),
    [isSkeleton, locale, orders],
  );

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`order-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, list]);

  return (
    <AdminShell title={t("admin.orders.title")}>
      <div className="space-y-4">
        {list.map((order) => (
          <article
            key={order.id}
            id={`order-${order.id}`}
            className={cn(
              "rounded-xl border p-4",
              isSkeleton && "skeleton pointer-events-none",
              highlightId === order.id && "border-[#527559] ring-2 ring-[#527559]/30",
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
                {(order.customer?.full_name || order.customer?.phone) && (
                  <p className="text-sm text-zinc-600">
                    {t("admin.orders.customer")}: {order.customer.full_name || order.customer.phone}
                    {order.customer.full_name && order.customer.phone
                      ? ` — ${order.customer.phone}`
                      : ""}
                  </p>
                )}
                {order.address?.address_line && (
                  <p className="text-xs text-zinc-500">{order.address.address_line}</p>
                )}
                <p className="text-xs text-zinc-500">
                  {t("admin.orders.payment")}: {t(`admin.payment.${order.payment_method}`)}
                  {order.payment_status ? ` · ${order.payment_status}` : ""}
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
                      {
                        successMessage: t("notifications.orderStatusUpdated"),
                        onSuccess: () => refetch(),
                      },
                    );
                  }}
                >
                  {STATUS_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {t(`admin.orders.status.${k}`)}
                    </option>
                  ))}
                </select>
                <select
                  className="max-w-[12rem] rounded border px-2 py-1 text-sm"
                  disabled={isSkeleton || ridersQuery.isLoading}
                  value={riderIds[order.id] ?? order.rider_id ?? ""}
                  onChange={(e) => setRiderIds((s) => ({ ...s, [order.id]: e.target.value }))}
                >
                  <option value="">{t("admin.orders.riderPlaceholder")}</option>
                  {(ridersQuery.data ?? []).map((rider) => (
                    <option key={rider.id} value={rider.id}>
                      {rider.full_name || rider.phone || rider.id.slice(0, 8)}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  variant="secondary"
                  loading={isActionPending}
                  loadingLabel={t("common.saving")}
                  disabled={isSkeleton || !(riderIds[order.id] ?? order.rider_id)}
                  onClick={() => {
                    if (isSkeleton) return;
                    const riderId = riderIds[order.id] ?? order.rider_id;
                    if (!riderId) return;
                    runAction(() => assignRiderAction(order.id, riderId), {
                      successMessage: t("notifications.riderAssigned"),
                      onSuccess: () => refetch(),
                    });
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
