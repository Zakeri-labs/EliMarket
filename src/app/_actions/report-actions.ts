"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { Order, Product } from "@/app/_types/database.types";

export type PeriodBucket = { period: string; total: number; count: number };

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
  lowStockProducts: Pick<
    Product,
    "id" | "name" | "stock" | "price" | "low_stock_threshold" | "inventory_unit"
  >[];
  recentOrders: Order[];
  revenueByDay: PeriodBucket[];
  revenueByWeek: PeriodBucket[];
  revenueByMonth: PeriodBucket[];
};

function isoWeekKey(date: Date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, "0")}`;
}

function bucketize(orders: Order[], keyFn: (d: Date) => string): PeriodBucket[] {
  const map = new Map<string, { total: number; count: number }>();
  for (const order of orders) {
    const key = keyFn(new Date(order.created_at));
    const entry = map.get(key) ?? { total: 0, count: 0 };
    entry.total += Number(order.total);
    entry.count += 1;
    map.set(key, entry);
  }
  return [...map.entries()]
    .map(([period, v]) => ({ period, ...v }))
    .sort((a, b) => b.period.localeCompare(a.period));
}

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

    const { data: lowStockRows, error: stockError } = await supabase
      .from("products")
      .select("id, name, stock, price, low_stock_threshold, inventory_unit")
      .order("stock")
      .limit(80);

    if (stockError) throw stockError;

    const lowStockProducts = ((lowStockRows ?? []) as FinancialReport["lowStockProducts"])
      .filter((product) => product.stock <= (product.low_stock_threshold ?? 5))
      .slice(0, 12);

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
      lowStockProducts,
      recentOrders: list.slice(0, 10),
      revenueByDay: bucketize(delivered, (d) => d.toISOString().slice(0, 10)).slice(0, 14),
      revenueByWeek: bucketize(delivered, isoWeekKey).slice(0, 12),
      revenueByMonth: bucketize(delivered, (d) => d.toISOString().slice(0, 7)).slice(0, 12),
    };

    return { success: true as const, data: report };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reportLoadFailed", err),
    };
  }
}
