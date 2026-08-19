"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { Order, Product } from "@/app/_types/database.types";

export type FinancialReport = {
  totalRevenue: number;
  deliveredRevenue: number;
  pendingRevenue: number;
  cancelledRevenue: number;
  orderCount: number;
  deliveredCount: number;
  pendingCount: number;
  cancelledCount: number;
  cashRevenue: number;
  onlineRevenue: number;
  lowStockProducts: Pick<Product, "id" | "name" | "stock" | "price">[];
  recentOrders: Order[];
  revenueByDay: { date: string; total: number; count: number }[];
};

export async function getFinancialReportAction() {
  try {
    const { supabase } = await requireAdmin();

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(name))")
      .order("created_at", { ascending: false });

    if (ordersError) throw ordersError;

    const list = (orders ?? []) as Order[];

    const delivered = list.filter((o) => o.status === "delivered");
    const pending = list.filter((o) =>
      ["pending", "confirmed", "preparing", "out_for_delivery"].includes(o.status),
    );
    const cancelled = list.filter((o) => o.status === "cancelled");

    const sum = (items: Order[]) =>
      items.reduce((acc, o) => acc + Number(o.total), 0);

    const cashRevenue = delivered
      .filter((o) => o.payment_method === "cash")
      .reduce((acc, o) => acc + Number(o.total), 0);

    const onlineRevenue = delivered
      .filter((o) => o.payment_method === "online")
      .reduce((acc, o) => acc + Number(o.total), 0);

    const dayMap = new Map<string, { total: number; count: number }>();
    for (const order of delivered) {
      const date = order.created_at.slice(0, 10);
      const entry = dayMap.get(date) ?? { total: 0, count: 0 };
      entry.total += Number(order.total);
      entry.count += 1;
      dayMap.set(date, entry);
    }

    const revenueByDay = [...dayMap.entries()]
      .map(([date, v]) => ({ date, ...v }))
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 14);

    const { data: lowStock, error: stockError } = await supabase
      .from("products")
      .select("id, name, stock, price")
      .lte("stock", 5)
      .order("stock")
      .limit(10);

    if (stockError) throw stockError;

    const report: FinancialReport = {
      totalRevenue: sum(delivered),
      deliveredRevenue: sum(delivered),
      pendingRevenue: sum(pending),
      cancelledRevenue: sum(cancelled),
      orderCount: list.length,
      deliveredCount: delivered.length,
      pendingCount: pending.length,
      cancelledCount: cancelled.length,
      cashRevenue,
      onlineRevenue,
      lowStockProducts: (lowStock ?? []) as FinancialReport["lowStockProducts"],
      recentOrders: list.slice(0, 10),
      revenueByDay,
    };

    return { success: true as const, data: report };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری گزارش مالی ناموفق بود"),
    };
  }
}
