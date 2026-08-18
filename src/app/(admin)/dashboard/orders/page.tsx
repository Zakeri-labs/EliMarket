"use client";

import { useState } from "react";
import { assignRiderAction, updateOrderStatusAction } from "@/app/_actions/order-actions";
import { useOrders } from "@/app/(admin)/dashboard/_hooks/use-orders";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import type { OrderStatus } from "@/app/_types/database.types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "در انتظار",
  confirmed: "تأیید",
  preparing: "آماده‌سازی",
  out_for_delivery: "ارسال",
  delivered: "تحویل",
  cancelled: "لغو",
};

export default function AdminOrdersPage() {
  const { data: orders, isLoading, refetch } = useOrders();
  const { runAction, isPending } = useFormAction();
  const [riderIds, setRiderIds] = useState<Record<string, string>>({});

  return (
    <AdminShell title="سفارش‌ها">
      {isLoading && <p>بارگذاری…</p>}
      <div className="space-y-4">
        {orders?.map((order) => (
          <article key={order.id} className="rounded-xl border p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="font-medium">سفارش {order.id.slice(0, 8)}…</p>
                <p className="text-sm text-zinc-500">
                  {new Date(order.created_at).toLocaleString("fa-IR")} — {STATUS_LABELS[order.status]}
                </p>
                <p className="text-sm">{Number(order.total).toLocaleString("fa-IR")} {order.currency}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  className="rounded border px-2 py-1 text-sm"
                  value={order.status}
                  onChange={(e) =>
                    runAction(
                      () => updateOrderStatusAction(order.id, e.target.value as OrderStatus),
                      { onSuccess: () => refetch() },
                    )
                  }
                >
                  {Object.entries(STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
                <input
                  className="w-36 rounded border px-2 py-1 text-sm"
                  placeholder="UUID پیک"
                  dir="ltr"
                  value={riderIds[order.id] ?? ""}
                  onChange={(e) => setRiderIds((s) => ({ ...s, [order.id]: e.target.value }))}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={isPending || !riderIds[order.id]}
                  onClick={() =>
                    runAction(
                      () => assignRiderAction(order.id, riderIds[order.id]),
                      { successMessage: "پیک تخصیص یافت", onSuccess: () => refetch() },
                    )
                  }
                >
                  تخصیص پیک
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
        {!isLoading && !orders?.length && (
          <p className="text-zinc-500">سفارشی یافت نشد.</p>
        )}
      </div>
    </AdminShell>
  );
}
