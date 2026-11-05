"use client";

import { formatCount } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { resolveLocalizedName } from "@/lib/i18n/product-name";
import { KpiCard } from "@/app/(admin)/_components/KpiCards";
import { formatOmanDate } from "@/config/oman-time";
import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { ListError } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFinancialReport } from "@/app/(admin)/dashboard/_hooks/use-financial-report";
import { DataTable } from "@/components/table";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import type { Order, OrderStatus } from "@/app/_types/database.types";
import { Select } from "@/components/ui/Select";

const STATUS_KEYS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return <KpiCard item={{ label, value, sub, icon: "chart" }} />;
}

// Keys come as 2026-11-05, 2026-11 or 2026-W44.
function periodLabel(period: string, locale: Locale, t: (key: string, params?: Record<string, string | number>) => string) {
  const resolveWeek = (week: number, year: number, target: Locale) =>
    t("adminUi.weekLabel", {
      week: formatCount(week, target),
      year: formatCount(year, target),
    });
  if (/^\d{4}-\d{2}-\d{2}$/.test(period)) return formatOmanDate(`${period}T12:00:00+04:00`, locale);
  if (/^\d{4}-\d{2}$/.test(period)) {
    return formatOmanDate(`${period}-15T12:00:00+04:00`, locale, { month: "long", year: "numeric" });
  }
  const week = period.match(/^(\d{4})-W(\d{1,2})$/);
  if (week) {
    return resolveWeek(Number(week[2]), Number(week[1]), locale);
  }
  return period;
}

export default function AdminReportsPage() {
  const { data: report, isPending, error, refetch } = useFinancialReport();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const isSkeleton = isPending;
  const { t, locale } = useTranslations();

  const orderColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        id: "orderId",
        accessorKey: "id",
        meta: { minWidth: 120 },
        header: t("admin.reports.colId"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs" dir="ltr">
            {String(getValue()).slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        meta: { minWidth: 150 },
        header: t("admin.reports.colDate"),
        cell: ({ getValue }) =>
          formatOmanDate(String(getValue()), locale),
      },
      {
        id: "status",
        accessorFn: (order) => t(`admin.status.${order.status}`),
        header: t("admin.reports.colStatus"),
        filterFn: (row, _id, value) =>
          !value || String(row.original.status) === String(value),
        meta: {
          minWidth: 130,
          filterComponent: ({ value, onFilterChange }) => (
            <Select
              aria-label={t("admin.reports.colStatus")}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onFilterChange(e.target.value || null)}
            >
              <option value="">{t("admin.products.filterAll")}</option>
              {STATUS_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(`admin.status.${k}`)}
                </option>
              ))}
            </Select>
          ),
        },
      },
      {
        id: "payment_method",
        accessorFn: (order) =>
          order.payment_method === "cash" ? t("admin.payment.cash") : t("admin.payment.online"),
        meta: { minWidth: 120 },
        header: t("admin.reports.colPayment"),
      },
      {
        accessorKey: "total",
        meta: { minWidth: 110 },
        header: t("admin.reports.colAmount"),
        cell: ({ getValue }) => (
          <Price amount={Number(getValue())} className="font-medium" />
        ),
      },
    ],
    [t, locale],
  );

  return (
    <AdminShell title={t("admin.reports.title")} subtitle={t("admin.reports.subtitle")}>
      {isSkeleton && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-busy="true">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-[var(--card-radius)] bg-[var(--skeleton)]" />
          ))}
        </div>
      )}
      {error && <ListError error={error} onRetry={() => void refetch()} />}

      {report && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard
              label={t("admin.reports.deliveredRevenue")}
              value={<Price amount={report.deliveredRevenue} />}
              sub={t("admin.reports.ordersCount", { count: formatCount(report.deliveredCount, locale) })}
            />
            <StatCard
              label={t("admin.reports.pendingRevenue")}
              value={<Price amount={report.pendingRevenue} />}
              sub={t("admin.reports.activeOrders", { count: formatCount(report.pendingCount, locale) })}
            />
            <StatCard
              label={t("admin.reports.cashPayment")}
              value={<Price amount={report.cashRevenue} />}
            />
            <StatCard
              label={t("admin.reports.onlinePayment")}
              value={<Price amount={report.onlineRevenue} />}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="admin-card p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  {period === "weekly"
                    ? t("admin.reports.weekly")
                    : period === "monthly"
                      ? t("admin.reports.monthly")
                      : t("admin.reports.revenue14Days")}
                </h2>
                <Select
                  aria-label={t("adminUi.period")}
                  className="!w-auto"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as typeof period)}
                >
                  <option value="daily">{t("admin.reports.daily")}</option>
                  <option value="weekly">{t("admin.reports.weekly")}</option>
                  <option value="monthly">{t("admin.reports.monthly")}</option>
                </Select>
              </div>
              {(() => {
                const rows =
                  period === "weekly"
                    ? report.revenueByWeek
                    : period === "monthly"
                      ? report.revenueByMonth
                      : report.revenueByDay;
                if (rows.length === 0) {
                  return <p className="text-sm text-muted">{t("admin.reports.noData")}</p>;
                }
                return (
                  <ul className="space-y-2">
                    {rows.map((row) => (
                      <li key={row.period} className="grid grid-cols-3 items-center gap-3 text-sm tabular-nums">
                        <span className="text-muted" dir="auto">
                          {periodLabel(row.period, locale, t)}
                        </span>
                        <Price amount={row.total} className="font-medium" />
                        <span className="text-muted">
                          {t("admin.reports.ordersCount", { count: formatCount(row.count, locale) })}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>

            <section className="admin-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t("admin.reports.lowStock")}</h2>
                <Link href="/dashboard/products" className="inline-flex min-h-11 items-center text-xs font-medium text-accent-dark md:min-h-8">
                  {t("admin.reports.manageProducts")}
                </Link>
              </div>
              {report.lowStockProducts.length === 0 ? (
                <p className="text-sm text-muted">{t("admin.reports.allStockOk")}</p>
              ) : (
                <ul className="space-y-2">
                  {report.lowStockProducts.map((p) => (
                    <li key={p.id} className="flex justify-between gap-3 rounded-xl bg-background px-3 py-2 text-sm">
                      <span className="min-w-0 truncate">{resolveLocalizedName(p, locale)}</span>
                      <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-amber-700"}>
                        {p.stock} {t("admin.reports.units")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section>
            <h2 className="mb-4 font-semibold">{t("admin.reports.recentOrders")}</h2>
            <DataTable
              data={report.recentOrders}
              columns={orderColumns}
              entityName={t("admin.reports.entityName")}
              isSkeleton={isSkeleton}
              onRefresh={() => void refetch()}
              onExport={async (rows) =>
                rows.map((order) => ({
                  [t("admin.reports.colId")]: order.id.slice(0, 8),
                  [t("admin.reports.colDate")]: formatOmanDate(order.created_at, locale),
                  [t("admin.reports.colStatus")]: t(`admin.status.${order.status}`),
                  [t("admin.reports.colPayment")]:
                    order.payment_method === "cash"
                      ? t("admin.payment.cash")
                      : t("admin.payment.online"),
                  [t("admin.reports.colAmount")]: order.total,
                }))
              }
            />
          </section>
        </div>
      )}
    </AdminShell>
  );
}
