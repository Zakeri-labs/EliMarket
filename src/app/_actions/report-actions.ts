"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { isMissingCampaignsRelation } from "@/lib/campaigns/load";
import type { Order, OrderItem, Product } from "@/app/_types/database.types";

export type PeriodBucket = { period: string; total: number; count: number };

export type PeriodSummary = {
  revenue: number;
  orders: number;
};

export type TopSeller = {
  product_id: string;
  name: string;
  quantity: number;
  revenue: number;
};

export type InventorySnapshot = {
  total: number;
  active: number;
  lowStock: number;
  outOfStock: number;
};

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
  today: PeriodSummary;
  week: PeriodSummary;
  month: PeriodSummary;
  topSellers: TopSeller[];
  inventory: InventorySnapshot;
  liveCampaigns: number;
};

const STORE_TZ = "Asia/Muscat";

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

function zonedYmd(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: STORE_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function shiftYmd(ymd: string, days: number) {
  const [year, month, day] = ymd.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + days));
  return date.toISOString().slice(0, 10);
}

function summarizePeriod(orders: Order[], include: (ymd: string) => boolean): PeriodSummary {
  const rows = orders.filter((order) => include(zonedYmd(new Date(order.created_at))));
  return {
    revenue: rows.reduce((sum, order) => sum + Number(order.total), 0),
    orders: rows.length,
  };
}

function isMissingProductsColumn(error: { message?: string; details?: string; hint?: string }) {
  const text = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    text.includes("products") &&
    (text.includes("does not exist") || text.includes("schema cache"))
  );
}

async function loadReportProducts(supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"]) {
  type ReportProduct = FinancialReport["lowStockProducts"][number] & { is_active?: boolean };

  const full = await supabase
    .from("products")
    .select("id, name, stock, price, low_stock_threshold, inventory_unit, is_active")
    .order("stock");

  if (!full.error) {
    return (full.data ?? []).map((product) => ({
      ...product,
      low_stock_threshold: product.low_stock_threshold ?? 5,
      inventory_unit: product.inventory_unit ?? "count",
      is_active: product.is_active,
    })) satisfies ReportProduct[];
  }
  if (!isMissingProductsColumn(full.error)) throw full.error;

  const fallback = await supabase
    .from("products")
    .select("id, name, stock, price, is_active")
    .order("stock");

  if (fallback.error) throw fallback.error;

  return (fallback.data ?? []).map((product) => ({
    ...product,
    low_stock_threshold: 5,
    inventory_unit: "count" as const,
    is_active: product.is_active,
  })) satisfies ReportProduct[];
}

function topSellersFromOrders(orders: Order[], limit = 8): TopSeller[] {
  const map = new Map<string, TopSeller>();
  for (const order of orders) {
    for (const item of (order.order_items ?? []) as OrderItem[]) {
      const id = item.product_id;
      if (!id) continue;
      const current = map.get(id) ?? {
        product_id: id,
        name: item.product?.name?.trim() || "—",
        quantity: 0,
        revenue: 0,
      };
      current.quantity += Number(item.quantity) || 0;
      current.revenue += Number(item.unit_price) * Number(item.quantity);
      if (item.product?.name?.trim()) current.name = item.product.name.trim();
      map.set(id, current);
    }
  }
  return [...map.values()]
    .sort((a, b) => b.quantity - a.quantity || b.revenue - a.revenue)
    .slice(0, limit);
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
    const sales = list.filter((o) => o.status !== "cancelled");

    const sum = (items: Order[]) =>
      items.reduce((acc, o) => acc + Number(o.total), 0);

    const cashRevenue = delivered
      .filter((o) => o.payment_method === "cash")
      .reduce((acc, o) => acc + Number(o.total), 0);

    const onlineRevenue = delivered
      .filter((o) => o.payment_method === "online")
      .reduce((acc, o) => acc + Number(o.total), 0);

    const products = await loadReportProducts(supabase);

    const lowStockProducts = products
      .filter((product) => product.stock <= (product.low_stock_threshold ?? 5))
      .slice(0, 12);

    const today = zonedYmd(new Date());
    const weekStart = shiftYmd(today, -6);
    const monthPrefix = today.slice(0, 7);
    const monthStart = `${monthPrefix}-01`;

    let liveCampaigns = 0;
    const nowIso = new Date().toISOString();
    const { data: campaignRows, error: campaignError } = await supabase
      .from("campaigns")
      .select("id")
      .eq("is_active", true)
      .lte("starts_at", nowIso)
      .gte("ends_at", nowIso);
    if (!campaignError) {
      liveCampaigns = campaignRows?.length ?? 0;
    } else if (!isMissingCampaignsRelation(campaignError)) {
      throw campaignError;
    }

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
      recentOrders: list.slice(0, 8),
      revenueByDay: bucketize(delivered, (d) => d.toISOString().slice(0, 10)).slice(0, 14),
      revenueByWeek: bucketize(delivered, isoWeekKey).slice(0, 12),
      revenueByMonth: bucketize(delivered, (d) => d.toISOString().slice(0, 7)).slice(0, 12),
      today: summarizePeriod(sales, (ymd) => ymd === today),
      week: summarizePeriod(sales, (ymd) => ymd >= weekStart && ymd <= today),
      month: summarizePeriod(sales, (ymd) => ymd >= monthStart && ymd <= today),
      topSellers: topSellersFromOrders(
        sales.filter((order) => zonedYmd(new Date(order.created_at)) >= monthStart),
      ),
      inventory: {
        total: products.length,
        active: products.filter((product) => product.is_active !== false).length,
        lowStock: products.filter((product) => product.stock <= (product.low_stock_threshold ?? 5)).length,
        outOfStock: products.filter((product) => product.stock <= 0).length,
      },
      liveCampaigns,
    };

    return { success: true as const, data: report };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.reportLoadFailed", err),
    };
  }
}
