"use client";

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
import { Button } from "@/components/ui/Button";
import { getNumberLocale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import type { Order } from "@/app/_types/database.types";

function OrderCard({
  order,
  actions,
}: {
  order: Order;
  actions?: React.ReactNode;
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
          <p className="mt-1 text-sm text-accent">
            {t(`orders.status.${order.status}`) || order.status}
          </p>
        </div>
        <p className="font-bold text-accent">{formatPrice(Number(order.total), order.currency)}</p>
      </div>
      {order.address?.address_line ? (
        <p className="mt-3 text-sm text-muted">{order.address.address_line}</p>
      ) : null}
      <p className="mt-1 text-xs text-muted">
        {t("checkout.paymentTitle")}: {t(`admin.payment.${order.payment_method}`)}
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

export default function RiderHomePage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending } = useFormAction();

  const readyQuery = useQuery({
    queryKey: ["rider-ready-orders"],
    queryFn: async () => {
      const result = await getReadyOrdersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchInterval: 15_000,
  });

  const mineQuery = useQuery({
    queryKey: ["rider-my-orders"],
    queryFn: async () => {
      const result = await getMyRiderOrdersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    refetchInterval: 15_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["rider-ready-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["rider-my-orders"] });
    void queryClient.invalidateQueries({ queryKey: ["rider-finance"] });
  };

  const active = (mineQuery.data ?? []).filter((o) => o.status === "out_for_delivery");
  const recent = (mineQuery.data ?? []).filter((o) => o.status !== "out_for_delivery").slice(0, 8);

  return (
    <RiderShell title={t("rider.ordersTitle")}>
      <section className="space-y-3">
        <h2 className="text-base font-semibold">{t("rider.readyTitle")}</h2>
        {readyQuery.isLoading ? (
          <p className="text-sm text-muted">{t("common.loading")}</p>
        ) : !readyQuery.data?.length ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            {t("rider.readyEmpty")}
          </p>
        ) : (
          readyQuery.data.map((order) => (
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
                      onSuccess: invalidate,
                    })
                  }
                >
                  {t("rider.accept")}
                </Button>
              }
            />
          ))
        )}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-base font-semibold">{t("rider.activeTitle")}</h2>
        {!active.length ? (
          <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted">
            {t("rider.activeEmpty")}
          </p>
        ) : (
          active.map((order) => (
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
          ))
        )}
      </section>

      {recent.length ? (
        <section className="mt-8 space-y-3">
          <h2 className="text-base font-semibold">{t("rider.recentTitle")}</h2>
          {recent.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </section>
      ) : null}
    </RiderShell>
  );
}
