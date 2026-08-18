"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getOrderByIdAction } from "@/app/_actions/order-actions";
import { createClient } from "@/core/supabase/client";
import type { Order, OrderStatus } from "@/app/_types/database.types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار تأیید",
  confirmed: "تأیید شده",
  preparing: "در حال آماده‌سازی",
  out_for_delivery: "در مسیر تحویل",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

export default function OrderTrackingClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const result = await getOrderByIdAction(orderId);
      if (!mounted) return;
      if (result.success && result.data) setOrder(result.data);
      else setError(result.error ?? "خطا");
    }

    load();

    const supabase = createClient();
    const channel = supabase
      .channel(`order-${orderId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `id=eq.${orderId}`,
        },
        (payload) => {
          setOrder((prev) => (prev ? { ...prev, ...(payload.new as Order) } : prev));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [orderId]);

  if (error) {
    return (
      <main className="mx-auto max-w-lg px-4 py-8">
        <p className="text-red-600">{error}</p>
        <Link href="/" className="mt-4 inline-block text-emerald-700">بازگشت</Link>
      </main>
    );
  }

  if (!order) {
    return <main className="px-4 py-8">در حال بارگذاری…</main>;
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-8">
      <Link href="/" className="mb-4 inline-block text-sm text-emerald-700">← فروشگاه</Link>
      <h1 className="mb-2 text-2xl font-bold">پیگیری سفارش</h1>
      <p className="mb-6 text-sm text-zinc-500">کد: {order.id.slice(0, 8)}…</p>

      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="text-lg font-semibold text-emerald-800">
          {STATUS_LABELS[order.status]}
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          زمان تحویل: {order.delivery_slot ?? "—"}
        </p>
      </div>

      <ul className="mt-6 space-y-2">
        {order.order_items?.map((item) => (
          <li key={item.id} className="flex justify-between text-sm">
            <span>{item.product?.name ?? item.product_id} × {item.quantity}</span>
            <span>{(Number(item.unit_price) * item.quantity).toLocaleString("fa-IR")}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-bold">
        جمع: {Number(order.total).toLocaleString("fa-IR")} {order.currency}
      </p>
    </main>
  );
}
