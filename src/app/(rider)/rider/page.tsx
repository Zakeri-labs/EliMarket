"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  acceptOrderAction,
  getMyRiderOrdersAction,
  getReadyOrdersAction,
  riderMarkDeliveredAction,
  riderMarkUndeliveredAction,
} from "@/app/_actions/rider-actions";
import { RiderShell } from "@/app/(rider)/_components/RiderShell";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { Button } from "@/components/ui/Button";
import { getNumberLocale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import type { Order } from "@/app/_types/database.types";

type OrdersTab = "assigned" | "ready" | "history";

function OrderCard({
  order,
  actions,
}: {
  order: Order;
  actions?: ReactNode;
}) {
  const { t, locale } = useTranslations();
  const formatPrice = useFormatPrice();

  return (
    <article className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">#{order.id.slice(0, 8).toUpperCase()}</p>
          <p className="mt-0.5 text-xs text-muted">
            {new Date(order.created_at).toLocaleString(getNumberLocale(locale))}
          </p>
          <p className="mt-1 text-sm font-medium text-accent">
            {t(`orders.status.${order.status}`) || order.status}
          </p>
        </div>
        <p className="font-bold text-accent">
          {formatPrice(Number(order.total), order.currency)}
        </p>
      </div>
      {order.address?.address_line ? (
        <p className="mt-3 text-sm text-muted">{order.address.address_line}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted">
        {t("checkout.paymentTitle")}: {t(`admin.payment.${order.payment_method}`)}
        {order.payment_status ? ` · ${order.payment_status}` : ""}
        {order.delivery_slot ? ` · ${order.delivery_slot}` : ""}
      </p>
      <ul className="mt-3 space-y-1 text-sm">
        {order.order_items?.map((item) => (
          <li key={item.id}>
            {item.product?.name ?? item.product_id} × {item.quantity}
          </li>
        ))}
      </ul>
      {actions ? <div className="mt-4 flex flex-wrap gap-2">{actions}</div> : null}
    </article>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted">
      {message}
    </p>
  );
}

export default function RiderHomePage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending } = useFormAction();
  const [tab, setTab] = useState<OrdersTab>("assigned");

  const readyQuery = useQuery({
    queryKey: ["rider-ready-orders"],
    queryFn: async () => {
      const result = await getReadyOrdersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchInterval: 12_000,
  });

  const mineQuery = useQuery({
    queryKey: ["rider-my-orders"],
    queryFn: async () => {
      const result = await getMyRiderOrdersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchInterval: 12_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["rider-ready-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["rider-my-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["rider-finance"] });
  };

  const assigned = (mineQuery.data ?? []).filter((o) => o.status === "out_for_delivery");
  const history = (mineQuery.data ?? []).filter((o) => o.status === "delivered");
  const ready = readyQuery.data ?? [];

  const tabs: { id: OrdersTab; label: string; title: string; count: number; hint?: string }[] = [
    {
      id: "assigned",
      label: t("rider.tabs.assigned"),
      title: t("rider.activeTitle"),
      count: assigned.length,
      hint: t("rider.activeHint"),
    },
    {
      id: "ready",
      label: t("rider.tabs.ready"),
      title: t("rider.readyTitle"),
      count: ready.length,
    },
    {
      id: "history",
      label: t("rider.tabs.history"),
      title: t("rider.recentTitle"),
      count: history.length,
    },
  ];

  const activeTab = tabs.find((item) => item.id === tab) ?? tabs[0];

  let body: ReactNode;
  if (tab === "assigned") {
    if (mineQuery.isLoading) {
      body = <p className="text-sm text-muted">{t("common.loading")}</p>;
    } else if (mineQuery.error) {
      body = <p className="text-sm text-danger">{(mineQuery.error as Error).message}</p>;
    } else if (!assigned.length) {
      body = <EmptyState message={t("rider.activeEmpty")} />;
    } else {
      body = (
        <div className="grid gap-3 lg:grid-cols-2">
          {assigned.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                <>
                  <Button
                    type="button"
                    className="flex-1"
                    loading={isPending}
                    loadingLabel={t("common.saving")}
                    onClick={() =>
                      runAction(() => riderMarkDeliveredAction(order.id), {
                        successMessage: t("notifications.orderDelivered"),
                        onSuccess: invalidate,
                      })
                    }
                  >
                    {t("rider.markDelivered")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    loading={isPending}
                    loadingLabel={t("common.saving")}
                    onClick={() =>
                      runAction(() => riderMarkUndeliveredAction(order.id), {
                        successMessage: t("notifications.orderReturned"),
                        onSuccess: invalidate,
                      })
                    }
                  >
                    {t("rider.markUndelivered")}
                  </Button>
                </>
              }
            />
          ))}
        </div>
      );
    }
  } else if (tab === "ready") {
    if (readyQuery.isLoading) {
      body = <p className="text-sm text-muted">{t("common.loading")}</p>;
    } else if (readyQuery.error) {
      body = <p className="text-sm text-danger">{(readyQuery.error as Error).message}</p>;
    } else if (!ready.length) {
      body = <EmptyState message={t("rider.readyEmpty")} />;
    } else {
      body = (
        <div className="grid gap-3 lg:grid-cols-2">
          {ready.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              actions={
                <Button
                  type="button"
                  fullWidth
                  loading={isPending}
                  loadingLabel={t("common.processing")}
                  onClick={() =>
                    runAction(() => acceptOrderAction(order.id), {
                      successMessage: t("notifications.orderAccepted"),
                      onSuccess: () => {
                        invalidate();
                        setTab("assigned");
                      },
                    })
                  }
                >
                  {t("rider.accept")}
                </Button>
              }
            />
          ))}
        </div>
      );
    }
  } else if (mineQuery.isLoading) {
    body = <p className="text-sm text-muted">{t("common.loading")}</p>;
  } else if (!history.length) {
    body = <EmptyState message={t("rider.historyEmpty")} />;
  } else {
    body = (
      <div className="grid gap-3 lg:grid-cols-2">
        {history.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    );
  }

  return (
    <RiderShell title={t("rider.ordersTitle")}>
      <div className="space-y-4">
        <div
          role="tablist"
          aria-label={t("rider.ordersTitle")}
          className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1"
        >
          {tabs.map((item) => {
            const selected = item.id === tab;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(item.id)}
                className={cn(
                  "inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-medium transition-colors sm:text-sm",
                  selected
                    ? "bg-accent text-background shadow-sm"
                    : "text-muted hover:text-foreground",
                )}
              >
                <span className="truncate">{item.label}</span>
                <span
                  className={cn(
                    "inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-md px-1.5 text-[11px] font-semibold",
                    selected ? "bg-background/20 text-background" : "bg-border/60 text-muted",
                  )}
                >
                  {item.count}
                </span>
              </button>
            );
          })}
        </div>

        {activeTab.hint ? (
          <div>
            <h2 className="text-base font-semibold">{activeTab.title}</h2>
            <p className="mt-0.5 text-xs text-muted">{activeTab.hint}</p>
          </div>
        ) : (
          <h2 className="text-base font-semibold">{activeTab.title}</h2>
        )}

        <div role="tabpanel">{body}</div>
      </div>
    </RiderShell>
  );
}
