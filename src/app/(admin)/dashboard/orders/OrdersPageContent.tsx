"use client";

import { resolveLocalizedName } from "@/lib/i18n/product-name";
import Link from "next/link";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notifyFormError } from "@/app/utils/form-notify";
import { KpiRow } from "@/app/(admin)/_components/KpiCards";
import { formatOmanDateTime } from "@/config/oman-time";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Bike,
  CreditCard,
  Image as ImageIcon,
  MapPin,
  Package,
  PackageCheck,
  Phone,
  Printer,
  UserRound,
} from "lucide-react";
import {
  assignRiderAction,
  getRidersAction,
  updateOrderStatusAction,
} from "@/app/_actions/order-actions";
import { getDeliveryProofUrlAction } from "@/app/_actions/rider-actions";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { mockAdminOrders } from "@/app/(admin)/dashboard/_mocks/order-mock";
import { useFormAction } from "@/app/hooks/use-form-action";
import { ListControls, ListPager, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import type { Order, OrderStatus } from "@/app/_types/database.types";
import { Select } from "@/components/ui/Select";

const STATUS_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  confirmed: "bg-background text-foreground border-border",
  preparing: "bg-background text-foreground border-border",
  out_for_delivery: "bg-sky-50 text-sky-800 border-sky-200",
  delivered: "bg-teal-50 text-teal-800 border-teal-200",
  cancelled: "bg-red-50 text-red-700 border-red-200",
};

function allowedStatusOptions(current: OrderStatus, hasRider: boolean): OrderStatus[] {
  if (current === "cancelled" || current === "delivered") {
    return [current];
  }
  const idx = STATUS_FLOW.indexOf(current);
  const options: OrderStatus[] = [current];
  if (idx >= 0 && idx < STATUS_FLOW.length - 1) {
    options.push(STATUS_FLOW[idx + 1]);
  }
  // Nobody could deliver it: without a rider, the way out of preparing is the assign button.
  if (current === "preparing" && !hasRider) {
    return [current, "cancelled"];
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

function ProofButton({
  orderId,
  kind,
  label,
  className,
}: {
  orderId: string;
  kind: "delivered" | "failed";
  label: string;
  className?: string;
}) {
  const { t } = useTranslations();
  const [loading, setLoading] = useState(false);
  return (
    <button
      type="button"
      disabled={loading}
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline-offset-2 hover:underline disabled:opacity-50",
        className,
      )}
      onClick={async () => {
        setLoading(true);
        const w = window.open("", "_blank");
        if (w) w.opener = null;
        try {
          const res = await getDeliveryProofUrlAction(orderId, kind);
          if (!res.success || !res.data?.url) throw new Error(res.success ? t("adminUi.proofMissing") : res.error);
          if (w) w.location.href = res.data.url;
        } catch (error) {
          w?.close();
          notifyFormError(error instanceof Error ? error.message : t("adminUi.proofMissing"));
        } finally {
          setLoading(false);
        }
      }}
    >
      <AppIcon icon={ImageIcon} size="xs" />
      {label}
    </button>
  );
}

export default function OrdersPageContent() {
  const { data: orders, isPending, error: loadError, refetch } = useOrders();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { t, locale } = useTranslations();
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const highlightId = searchParams.get("highlight");
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const applyStatus = (orderId: string, next: OrderStatus) => {
    runAction(() => updateOrderStatusAction(orderId, next), {
      successMessage: t("notifications.orderStatusUpdated"),
      onSuccess: () => void refetch(),
    });
  };

  const ridersQuery = useQuery({
    queryKey: ["riders"],
    queryFn: async () => {
      const result = await getRidersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const isSkeleton = isPending;
  const [statusFilter, setStatusFilter] = useState("");
  const skeletonOrders = useMemo(() => mockAdminOrders(locale), [locale]);
  const orderFilter = useCallback(
    (order: Order) => !statusFilter || order.status === statusFilter,
    [statusFilter],
  );
  const revealHighlighted = useCallback(
    (order: Order) => order.id === highlightId,
    [highlightId],
  );
  const controls = useListControls(orders ?? [], {
    filter: orderFilter,
    reveal: highlightId ? revealHighlighted : undefined,
    searchId: true,
  });
  const list = isSkeleton ? skeletonOrders : controls.visible;
  const presentStatuses = useMemo(
    () => [...new Set([...(orders ?? []).map((order) => order.status), ...(statusFilter ? [statusFilter as OrderStatus] : [])])],
    [orders, statusFilter],
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
    el?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    });
  }, [highlightId, controls.page, isSkeleton]);

  return (
    <AdminShell title={t("admin.orders.title")} subtitle={t("admin.orders.subtitle")}>
      <KpiRow
        hidden={Boolean(loadError) && !orders}
        items={[{ label: t("adminUi.total"), value: orders?.length, icon: "bag", tone: "teal" },
{ label: t("adminUi.needsAction"), value: orders?.filter((o) => ["pending", "confirmed", "preparing"].includes(o.status)).length, icon: "clock", tone: "amber" },
{ label: t("adminUi.onTheWay"), value: orders?.filter((o) => o.status === "out_for_delivery").length, icon: "truck", tone: "sky" },
{ label: t("adminUi.delivered"), value: orders?.filter((o) => o.status === "delivered").length, icon: "check", tone: "teal" },]}
      />
      <div className="space-y-4">
        {loadError ? <ListError error={loadError} onRetry={() => void refetch()} /> : null}
        <ListControls
          list={controls}
          entity={t("admin.orders.title")}
          onClearFilters={() => setStatusFilter("")}
          filters={
            <div className="sm:w-52">
              <Select
                value={statusFilter}
                aria-label={t("admin.orders.statusLabel")}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  controls.setPage(0);
                }}
              >
                <option value="">{t("table.all")}</option>
                {presentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {t(`admin.status.${status}`)}
                  </option>
                ))}
              </Select>
            </div>
          }
        />
        {list.map((order) => {
          if (isSkeleton) {
            return (
              <div key={order.id} className="skeleton" aria-busy>
                <div className="target h-80 w-full rounded-2xl md:h-56" />
              </div>
            );
          }

          const status = order.status as OrderStatus;
          const assignReady = canAssignRider(status);
          const selectedRider = riderIds[order.id] ?? "";
          const assignedName = riderLabel(order);
          const statusOptions = allowedStatusOptions(status, Boolean(order.rider_id));

          return (
            <article
              key={order.id}
              id={`order-${order.id}`}
              className={cn(
                "overflow-hidden admin-card",
                highlightId === order.id &&
                  "border-accent ring-2 ring-accent/25",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-background px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold text-foreground">
                    {t("admin.orders.orderPrefix")}{" "}
                    <span className="font-mono text-foreground" dir="ltr">
                      {`${order.id.slice(0, 8)}…`}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {formatOmanDateTime(order.created_at, locale)}
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
                  <Price
                    amount={Number(order.total)}
                    currency={order.currency}
                    className="text-sm font-semibold text-foreground"
                  />
                </div>
              </div>

              <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)]">
                <div className="space-y-2 text-sm">
                  {(order.customer?.full_name || order.customer?.phone) && (
                    <p className="flex items-start gap-2 text-foreground">
                      <AppIcon icon={UserRound} size="sm" className="mt-0.5 text-foreground" />
                      <span>
                        <span className="text-muted">{t("admin.orders.customer")}: </span>
                        {order.customer.full_name || order.customer.phone}
                      </span>
                    </p>
                  )}
                  {order.customer?.phone ? (
                    <p className="flex items-start gap-2 text-foreground">
                      <AppIcon icon={Phone} size="sm" className="mt-0.5 text-foreground" />
                      <span>
                        <span className="text-muted">{t("admin.orders.phone")}: </span>
                        <a
                          href={`tel:${order.customer.phone}`}
                          dir="ltr"
                          className="font-medium text-foreground hover:underline"
                        >
                          {order.customer.phone}
                        </a>
                      </span>
                    </p>
                  ) : null}
                  {order.address?.address_line ? (
                    <p className="flex items-start gap-2 text-foreground">
                      <AppIcon icon={MapPin} size="sm" className="mt-0.5 text-foreground" />
                      <span dir="auto">{order.address.address_line}</span>
                    </p>
                  ) : null}
                  <p className="flex items-start gap-2 text-foreground">
                    <AppIcon icon={CreditCard} size="sm" className="mt-0.5 text-foreground" />
                    <span>
                      {t("admin.orders.payment")}:{" "}
                      {t(`admin.payment.${order.payment_method}`)}
                      {order.payment_status ? ` · ${t(`adminUi.payment_${order.payment_status}`)}` : ""}
                    </span>
                  </p>
                  {assignedName ? (
                    <p className="flex items-start gap-2 text-foreground">
                      <AppIcon icon={Bike} size="sm" className="mt-0.5 text-foreground" />
                      <span>
                        {t("admin.orders.assignedRider")}: {assignedName}
                      </span>
                    </p>
                  ) : null}
                  {order.picked_up_at ? (
                    <p className="flex items-start gap-2 text-foreground">
                      <AppIcon
                        icon={PackageCheck}
                        size="sm"
                        className="mt-0.5 text-foreground"
                      />
                      <span>
                        {t("admin.orders.pickedUpAt")}:{" "}
                        {formatOmanDateTime(order.picked_up_at, locale)}
                      </span>
                    </p>
                  ) : null}
                  {order.delivered_photo_path ? (
                    <ProofButton
                      orderId={order.id}
                      kind="delivered"
                      label={t("admin.orders.viewDeliveryProof")}
                    />
                  ) : null}
                  {order.failed_delivery_reason ? (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
                      <p className="font-semibold">
                        {t("admin.orders.failedDeliveryTitle")}:{" "}
                        {t(
                          `admin.orders.failReason.${order.failed_delivery_reason}`,
                        )}
                      </p>
                      {order.failed_delivery_note ? (
                        <p className="mt-1 text-red-700">
                          {t("admin.orders.failedDeliveryNote")}:{" "}
                          <bdi>{order.failed_delivery_note}</bdi>
                        </p>
                      ) : null}
                      {order.failed_delivery_at ? (
                        <p className="mt-1 text-xs text-red-600">
                          {formatOmanDateTime(order.failed_delivery_at, locale)}
                        </p>
                      ) : null}
                      {order.failed_delivery_photo_path ? (
                        <ProofButton
                          orderId={order.id}
                          kind="failed"
                          label={t("admin.orders.viewFailPhoto")}
                          className="mt-2"
                        />
                      ) : null}
                    </div>
                  ) : null}
                  <ul className="mt-3 space-y-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-[#52525b]">
                    {order.order_items?.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <AppIcon icon={Package} size="xs" className="text-foreground" />
                        <span>
                          {item.product ? resolveLocalizedName(item.product, locale) : item.product_id} × {item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      {t("admin.orders.statusLabel")}
                    </label>
                    <Select
                      value={status}
                      aria-label={t("admin.orders.statusLabel")}
                      disabled={isActionPending || statusOptions.length <= 1}
                      onChange={(e) => {
                        const next = e.target.value as OrderStatus;
                        // A cancelled order cannot come back, so this one asks first.
                        if (next === "cancelled") setCancelOrderId(order.id);
                        else applyStatus(order.id, next);
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
                    </Select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">
                      {t("admin.orders.riderLabel")}
                    </label>
                    <Select
                      aria-label={t("admin.orders.riderLabel")}
                      disabled={
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
                      {order.rider_id && !(ridersQuery.data ?? []).some((rider) => rider.id === order.rider_id) ? (
                        <option value={order.rider_id}>{riderLabel(order)}</option>
                      ) : null}
                      {(ridersQuery.data ?? []).map((rider) => (
                        <option key={rider.id} value={rider.id}>
                          {rider.full_name || rider.phone || rider.id.slice(0, 8)}
                        </option>
                      ))}
                    </Select>
                    {ridersQuery.error ? (
                      <p className="mt-1 text-xs leading-relaxed text-red-700">{t("table.loadFailed")}</p>
                    ) : assignReady && ridersQuery.data?.length === 0 ? (
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {t("adminUi.noRiders")}{" "}
                        <Link href="/dashboard/riders" className="font-medium text-accent-dark underline">
                          {t("adminUi.goToRiders")}
                        </Link>
                      </p>
                    ) : !assignReady ? (
                      <p className="mt-1 text-xs leading-relaxed text-muted">
                        {status === "out_for_delivery"
                          ? t("adminUi.riderLockedOnWay")
                          : status === "delivered"
                            ? t("adminUi.riderLockedDelivered")
                            : status === "cancelled"
                              ? t("adminUi.riderLockedCancelled")
                              : t("admin.orders.assignAfterPreparing")}
                      </p>
                    ) : null}
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    loading={isActionPending && pendingOrderId === order.id}
                    loadingLabel={t("common.saving")}
                    disabled={
                      !assignReady ||
                      !selectedRider ||
                      isActionPending
                    }
                    className="!bg-accent !text-white !shadow-none hover:!bg-accent-dark disabled:!bg-[var(--skeleton)] disabled:!text-muted"
                    onClick={() => {
                      if (!selectedRider) return;
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

                  <button
                    type="button"
                    onClick={() => {
                      window.open(
                        `/print/order/${order.id}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    }}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-input bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent/60 md:min-h-10"
                  >
                    <AppIcon icon={Printer} size="sm" />
                    {t("admin.orders.printInvoice")}
                  </button>
                </div>
              </div>
            </article>
          );
        })}
        {!isSkeleton && !loadError && !orders?.length && (
          <p className="admin-card p-8 text-center text-sm text-muted">
            {t("admin.orders.empty")}
          </p>
        )}
        <ListPager list={controls} />
        {!isSkeleton && orders?.length ? (
          <p className="text-center text-xs leading-relaxed text-muted">{t("admin.orders.statusHint")}</p>
        ) : null}
      </div>
      <ConfirmDialog
        open={Boolean(cancelOrderId)}
        title={t("adminUi.cancelOrderTitle")}
        description={t("adminUi.cancelOrderBody")}
        confirmLabel={t("adminUi.cancelOrderYes")}
        cancelLabel={t("adminUi.keepOrder")}
        onOpenChange={(next) => {
          if (!next) setCancelOrderId(null);
        }}
        onConfirm={() => {
          if (cancelOrderId) applyStatus(cancelOrderId, "cancelled");
          setCancelOrderId(null);
        }}
      />
    </AdminShell>
  );
}
