"use client";



import { useEffect, useState } from "react";

import Link from "next/link";
import { ChevronDown, ChevronLeft, Phone, Truck } from "lucide-react";
import { getOrderByIdAction } from "@/app/_actions/order-actions";
import { OrderStepper } from "@/app/(storefront)/_components/OrderStepper";
import { createClient } from "@/core/supabase/client";
import type { Order, OrderStatus } from "@/app/_types/database.types";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";



export default function OrderTrackingClient({ orderId }: { orderId: string }) {

  const [order, setOrder] = useState<Order | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [itemsOpen, setItemsOpen] = useState(true);

  const { t } = useTranslations();

  const formatPrice = useFormatPrice();



  useEffect(() => {

    let mounted = true;



    async function load() {

      const result = await getOrderByIdAction(orderId);

      if (!mounted) return;

      if (result.success && result.data) setOrder(result.data);

      else setError(result.error ?? "Error");

    }



    load();



    const supabase = createClient();

    const channel = supabase

      .channel(`order-${orderId}`)

      .on(

        "postgres_changes",

        { event: "UPDATE", schema: "public", table: "orders", filter: `id=eq.${orderId}` },

        (payload: { new: Partial<Order> }) =>
          setOrder((prev) => (prev ? { ...prev, ...payload.new } : prev)),

      )

      .subscribe();



    return () => {

      mounted = false;

      void supabase.removeChannel(channel);

    };

  }, [orderId]);



  if (error) {

    return (

      <main className="px-4 py-8">

        <p className="text-danger">{error}</p>

        <Link href="/" className="mt-4 inline-block text-accent">{t("orders.tracking.back")}</Link>

      </main>

    );

  }



  if (!order) {

    return <main className="px-4 py-8 text-muted">{t("orders.tracking.loading")}</main>;

  }



  const statusLabel =

    t(`orders.tracking.${order.status}`) || order.status;



  return (

    <main className="py-4 md:py-6">

      <div className="mb-4 flex items-center justify-between">

        <Link href="/orders" className="inline-flex items-center gap-1 text-sm text-accent">
          <AppIcon icon={ChevronLeft} size="sm" className="rtl:rotate-180" />
          {t("orders.tracking.backToOrders")}
        </Link>

        <button type="button" className="text-sm text-accent">{t("orders.tracking.help")}</button>

      </div>



      <p className="text-xs text-muted">

        {t("orders.tracking.orderNumber", { id: order.id.slice(0, 8) })}

      </p>

      <h1 className="mt-1 text-lg font-bold">{statusLabel}</h1>

      <p className="mt-1 text-sm text-accent">

        {t("orders.tracking.estimatedDelivery", { slot: order.delivery_slot ?? "—" })}

      </p>



      <div className="my-6 flex justify-center">
        <AppIcon icon={Truck} size="2xl" className="text-accent" />
      </div>



      <OrderStepper status={order.status} />



      <button

        type="button"

        className="mt-6 flex w-full items-center justify-between rounded-2xl border border-border bg-surface p-4 text-sm"

        onClick={() => setItemsOpen(!itemsOpen)}

      >

        <span>{t("orders.tracking.itemCount", { count: order.order_items?.length ?? 0 })}</span>

        <span className="text-muted">
          <AppIcon icon={ChevronDown} size="sm" className={itemsOpen ? "" : "-rotate-90 rtl:rotate-90"} />
        </span>

      </button>

      {itemsOpen && (

        <ul className="mt-2 space-y-2">

          {order.order_items?.map((item) => (

            <li key={item.id} className="flex justify-between rounded-xl bg-surface-elevated px-3 py-2 text-sm">

              <span>{item.product?.name ?? t("product.fallbackName")} × {item.quantity}</span>

              <span className="text-accent">

                {formatPrice(Number(item.unit_price) * item.quantity)}

              </span>

            </li>

          ))}

        </ul>

      )}



      <p className="mt-4 text-center font-bold text-accent">

        {formatPrice(Number(order.total), order.currency)}

      </p>



      {order.status === "out_for_delivery" && (
        <Button type="button" variant="outline" fullWidth className="mt-4 inline-flex items-center justify-center gap-2">
          <AppIcon icon={Phone} size="sm" />
          {t("orders.tracking.callDriver")}
        </Button>
      )}

    </main>

  );

}

