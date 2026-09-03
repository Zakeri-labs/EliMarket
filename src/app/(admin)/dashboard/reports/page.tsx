"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFinancialReport } from "@/app/(admin)/dashboard/_hooks/use-financial-report";
import { DataTable } from "@/components/table";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import type { Order, OrderStatus } from "@/app/_types/database.types";

const STATUS_KEYS: OrderStatus[] = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

function StatCard({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#71717a]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#0f766e]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#71717a]">{sub}</p>}
    </div>
  );
}

export default function AdminReportsPage() {
  const { data: report, isPending, error, refetch } = useFinancialReport();
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const isSkeleton = isPending;
  const { t, locale } = useTranslations();

  const orderColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: t("admin.reports.colId"),
        cell: ({ getValue }) => (
          <span className="font-mono text-xs" dir="ltr">
            {String(getValue()).slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: t("admin.reports.colDate"),
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString(getNumberLocale(locale)),
      },
      {
        accessorKey: "status",
        header: t("admin.reports.colStatus"),
        cell: ({ getValue }) => t(`admin.status.${String(getValue())}`),
        filterFn: (row, _id, value) =>
          !value || String(row.original.status) === String(value),
        meta: {
          filterComponent: ({ value, onFilterChange }) => (
            <select
              className="h-9 w-full rounded-xl border border-[#e4e4e7] px-3 text-sm"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onFilterChange(e.target.value || null)}
            >
              <option value="">{t("admin.products.filterAll")}</option>
              {STATUS_KEYS.map((k) => (
                <option key={k} value={k}>
                  {t(`admin.status.${k}`)}
                </option>
              ))}
            </select>
          ),
        },
      },
      {
        accessorKey: "payment_method",
        header: t("admin.reports.colPayment"),
        cell: ({ getValue }) =>
          getValue() === "cash" ? t("admin.payment.cash") : t("admin.payment.online"),
      },
      {
        accessorKey: "total",
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
      {isSkeleton && <p className="text-[#71717a]">{t("admin.reports.loading")}</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {report && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label={t("admin.reports.deliveredRevenue")}
              value={<Price amount={report.deliveredRevenue} />}
              sub={t("admin.reports.ordersCount", { count: report.deliveredCount })}
            />
            <StatCard
              label={t("admin.reports.pendingRevenue")}
              value={<Price amount={report.pendingRevenue} />}
              sub={t("admin.reports.activeOrders", { count: report.pendingCount })}
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
            <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-semibold">
                  {period === "weekly"
                    ? t("admin.reports.weekly")
                    : period === "monthly"
                      ? t("admin.reports.monthly")
                      : t("admin.reports.revenue14Days")}
                </h2>
                <select
                  className="h-9 rounded-xl border border-[#e4e4e7] px-3 text-sm"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as typeof period)}
                >
                  <option value="daily">{t("admin.reports.daily")}</option>
                  <option value="weekly">{t("admin.reports.weekly")}</option>
                  <option value="monthly">{t("admin.reports.monthly")}</option>
                </select>
              </div>
              {(() => {
                const rows =
                  period === "weekly"
                    ? report.revenueByWeek
                    : period === "monthly"
                      ? report.revenueByMonth
                      : report.revenueByDay;
                if (rows.length === 0) {
                  return <p className="text-sm text-[#71717a]">{t("admin.reports.noData")}</p>;
                }
                return (
                  <ul className="space-y-2">
                    {rows.map((row) => (
                      <li key={row.period} className="flex justify-between text-sm">
                        <span className="text-[#71717a]">{row.period}</span>
                        <Price amount={row.total} className="font-medium" />
                        <span className="text-[#71717a]">
                          {t("admin.reports.ordersCount", { count: row.count })}
                        </span>
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </section>

            <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">{t("admin.reports.lowStock")}</h2>
                <Link href="/dashboard/products" className="text-xs text-[#0f766e]">
                  {t("admin.reports.manageProducts")}
                </Link>
              </div>
              {report.lowStockProducts.length === 0 ? (
                <p className="text-sm text-[#71717a]">{t("admin.reports.allStockOk")}</p>
              ) : (
                <ul className="space-y-2">
                  {report.lowStockProducts.map((p) => (
                    <li key={p.id} className="flex justify-between rounded-xl bg-[#f4f4f5] px-3 py-2 text-sm">
                      <span>{p.name}</span>
                      <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-amber-700"}>
                        {p.stock} {t("admin.reports.units")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">{t("admin.reports.recentOrders")}</h2>
            <DataTable
              data={report.recentOrders}
              columns={orderColumns}
              entityName={t("admin.reports.entityName")}
              isSkeleton={isSkeleton}
              onRefresh={() => void refetch()}
              columnSizingStorageKey="admin-recent-orders"
              enableColumnResizing={false}
              onExport={async () =>
                report.recentOrders.map((order) => ({
                  id: order.id.slice(0, 8),
                  date: new Date(order.created_at).toLocaleDateString(getNumberLocale(locale)),
                  status: t(`admin.status.${order.status}`),
                  payment:
                    order.payment_method === "cash"
                      ? t("admin.payment.cash")
                      : t("admin.payment.online"),
                  total: order.total,
                }))
              }
            />
          </section>
        </div>
      )}
    </AdminShell>
  );
}
