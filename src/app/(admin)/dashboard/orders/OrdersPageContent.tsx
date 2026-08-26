"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bike,
  CreditCard,
  MapPin,
  Package,
  UserRound,
} from "lucide-react";
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
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/app/utils/cn";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import type { Order, OrderStatus } from "@/app/_types/database.types";

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-[#0d9488]/12 text-[#0f766e] border-[#0d9488]/35",
  preparing: "bg-[#0f766e]/15 text-[#3f5c44] border-[#0f766e]/40",
  out_for_delivery: "bg-sky-50 text-sky-800 border-sky-200",
  delivered: "bg-emerald-50 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

const selectClass =
  "rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-3 py-2 text-sm text-[#18181b] outline-none focus:border-[#0f766e] disabled:cursor-not-allowed disabled:opacity-55";

function allowedStatusOptions(current: OrderStatus): OrderStatus[] {
  if (current === "cancelled" || current === "delivered") {
    return [current];
  }
  const idx = STATUS_FLOW.indexOf(current);
  const options: OrderStatus[] = [current];
  if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
    options.push(STATUS_FLOW[idx + 1]);
  }
  // Preparing → shipping is normally via assign; still allow manual override
  if (current === "preparing" && !options.includes("out_for_delivery")) {
    options.push("out_for_delivery");
  }
  // Return to kitchen if delivery failed
  if (current === "out_for_delivery") {
    options.push("preparing");
  }
  options.push("cancelled");
  return options;
}

function canAssignRider(status: OrderStatus) {
  return status === "preparing";
}

export default function OrdersPageContent() {
  const { data: orders, isPending, refetch } = useOrders();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { t, locale } = useTranslations();
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);

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

  const riderLabel = (order: Order) => {
    const id = order.rider_id;
    if (!id) return null;
    const rider = ridersQuery.data?.find((r) => r.id === id);
    return rider?.full_name || rider?.phone || id.slice(0, 8);
  };

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`order-${highlightId}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [highlightId, list]);

  return (
    <AdminShell title={t("admin.orders.title")} subtitle={t("admin.orders.subtitle")}>
      <div className="space-y-4">
        {list.map((order) => {
          const status = order.status as OrderStatus;
          const assignReady = canAssignRider(status);
          const selectedRider = riderIds[order.id] ?? "";
          const assignedName = riderLabel(order);
          const statusOptions = isSkeleton
            ? STATUS_FLOW
            : allowedStatusOptions(status);

          return (
            <article
              key={order.id}
              id={`order-${order.id}`}
              className={cn(
                "overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white shadow-sm",
                isSkeleton && "skeleton pointer-events-none",
                highlightId === order.id &&
                  "border-[#0f766e] ring-2 ring-[#0f766e]/25",
              )}
              aria-busy={isSkeleton}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f4f4f5] bg-[#f7faf7] px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-[#18181b]">
                    {t("admin.orders.orderPrefix")}{" "}
                    <span className="font-mono text-[#0f766e]" dir="ltr">
                      {isSkeleton
                        ? mockAdminOrderIdPreview(locale)
                        : `${order.id.slice(0, 8)}…`}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-[#71717a]">
                    {isSkeleton
                      ? mockAdminOrderDateLabel(locale)
                      : new Date(order.created_at).toLocaleString(getNumberLocale(locale))}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs font-semibold",
                      STATUS_BADGE[status] ?? STATUS_BADGE.pending,
                    )}
                  >
                    {t(`admin.orders.status.${status}`)}
                  </span>
                  <span className="rounded-full bg-[#0f766e] px-2.5 py-1 text-xs font-bold text-white tabular-nums">
                    {Number(order.total).toLocaleString(getNumberLocale(locale))}{" "}
                    {order.currency}
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                <div className="space-y-2 text-sm">
                  {(order.customer?.full_name || order.customer?.phone) && (
                    <p className="flex items-start gap-2 text-[#3f3f46]">
                      <AppIcon icon={UserRound} size="sm" className="mt-0.5 text-[#0d9488]" />
                      <span>
                        <span className="text-[#71717a]">{t("admin.orders.customer")}: </span>
                        {order.customer.full_name || order.customer.phone}
                        {order.customer.full_name && order.customer.phone
                          ? ` — ${order.customer.phone}`
                          : ""}
                      </span>
                    </p>
                  )}
                  {order.address?.address_line ? (
                    <p className="flex items-start gap-2 text-[#3f3f46]">
                      <AppIcon icon={MapPin} size="sm" className="mt-0.5 text-[#0d9488]" />
                      <span>{order.address.address_line}</span>
                    </p>
                  ) : null}
                  <p className="flex items-start gap-2 text-[#3f3f46]">
                    <AppIcon icon={CreditCard} size="sm" className="mt-0.5 text-[#0d9488]" />
                    <span>
                      {t("admin.orders.payment")}:{" "}
                      {t(`admin.payment.${order.payment_method}`)}
                      {order.payment_status ? ` · ${order.payment_status}` : ""}
                    </span>
                  </p>
                  {assignedName ? (
                    <p className="flex items-start gap-2 text-[#3f3f46]">
                      <AppIcon icon={Bike} size="sm" className="mt-0.5 text-[#0d9488]" />
                      <span>
                        {t("admin.orders.assignedRider")}: {assignedName}
                      </span>
                    </p>
                  ) : null}
                  <ul className="mt-3 space-y-1.5 rounded-xl border border-[#e4e4e7] bg-[#fafafa] px-3 py-2.5 text-[#52525b]">
                    {order.order_items?.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <AppIcon icon={Package} size="xs" className="text-[#0d9488]" />
                        <span>
                          {item.product?.name ?? item.product_id} × {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-[#e4e4e7] bg-[#f7faf7] p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#71717a]">
                      {t("admin.orders.statusLabel")}
                    </label>
                    <select
                      className={cn(selectClass, "w-full")}
                      value={status}
                      disabled={isSkeleton || isActionPending || status === "delivered"}
                      onChange={(e) => {
                        if (isSkeleton) return;
                        const next = e.target.value as OrderStatus;
                        setPendingOrderId(order.id);
                        runAction(() => updateOrderStatusAction(order.id, next), {
                          successMessage: t("notifications.orderStatusUpdated"),
                          onSuccess: () => {
                            setPendingOrderId(null);
                            void refetch();
                          },
                          onError: () => setPendingOrderId(null),
                        });
                      }}
                    >
                      {statusOptions.map((k) => (
                        <option key={k} value={k}>
                          {t(`admin.orders.status.${k}`)}
                        </option>
                      ))}
                      {/* Keep current visible even if not in filtered list */}
                      {!statusOptions.includes(status) ? (
                        <option value={status}>
                          {t(`admin.orders.status.${status}`)}
                        </option>
                      ) : null}
                    </select>
                    <p className="mt-1 text-[11px] leading-relaxed text-[#a1a1aa]">
                      {t("admin.orders.statusHint")}
                    </p>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-[#71717a]">
                      {t("admin.orders.riderLabel")}
                    </label>
                    <select
                      className={cn(selectClass, "w-full")}
                      disabled={
                        isSkeleton ||
                        ridersQuery.isLoading ||
                        !assignReady ||
                        isActionPending
                      }
                      value={assignReady ? selectedRider : order.rider_id ?? ""}
                      onChange={(e) =>
                        setRiderIds((s) => ({ ...s, [order.id]: e.target.value }))
                      }
                    >
                      <option value="">{t("admin.orders.riderPlaceholder")}</option>
                      {(ridersQuery.data ?? []).map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.full_name || rider.phone || rider.id.slice(0, 8)}
                        </option>
                      ))}
                    </select>
                    {!assignReady && status !== "out_for_delivery" && status !== "delivered" ? (
                      <p className="mt-1 text-[11px] leading-relaxed text-amber-700">
                        {t("admin.orders.assignAfterPreparing")}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    loading={isActionPending && pendingOrderId === order.id}
                    loadingLabel={t("common.saving")}
                    disabled={
                      isSkeleton ||
                      !assignReady ||
                      !selectedRider ||
                      isActionPending
                    }
                    className="!rounded-xl !bg-[#0f766e] !text-white !shadow-none hover:!bg-[#3f5c44] disabled:!bg-[#e4e4e7] disabled:!text-[#a1a1aa]"
                    onClick={() => {
                      if (isSkeleton || !selectedRider) return;
                      setPendingOrderId(order.id);
                      runAction(() => assignRiderAction(order.id, selectedRider), {
                        successMessage: t("notifications.riderAssigned"),
                        onSuccess: () => {
                          setPendingOrderId(null);
                          setRiderIds((s) => {
                            const next = { ...s };
                            delete next[order.id];
                            return next;
                          });
                          void refetch();
                        },
                        onError: () => setPendingOrderId(null),
                      });
                    }}
                  >
                    {t("admin.orders.assignRider")}
                  </Button>
                </div>
              </div>
            </article>
          );
        })}
        {!isSkeleton && !orders?.length && (
          <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white p-8 text-center text-sm text-[#71717a]">
            {t("admin.orders.empty")}
          </p>
        )}
      </div>
    </AdminShell>
  );
}
