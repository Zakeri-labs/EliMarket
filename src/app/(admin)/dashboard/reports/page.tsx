"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFinancialReport } from "@/app/(admin)/dashboard/_hooks/use-financial-report";
import { DataTable } from "@/components/table";
import { formatPrice } from "@/config/brand";
import type { Order } from "@/app/_types/database.types";

const STATUS_LABELS: Record<string, string> = {
  pending: "در انتظار",
  confirmed: "تأیید شده",
  preparing: "آماده‌سازی",
  out_for_delivery: "در مسیر",
  delivered: "تحویل شده",
  cancelled: "لغو شده",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#71717a]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-[#527559]">{value}</p>
      {sub && <p className="mt-1 text-xs text-[#71717a]">{sub}</p>}
    </div>
  );
}

export default function AdminReportsPage() {
  const { data: report, isLoading, error, refetch } = useFinancialReport();

  const orderColumns = useMemo<ColumnDef<Order>[]>(
    () => [
      {
        accessorKey: "id",
        header: "شناسه",
        cell: ({ getValue }) => (
          <span className="font-mono text-xs" dir="ltr">
            {String(getValue()).slice(0, 8)}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        header: "تاریخ",
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString("fa-IR"),
      },
      {
        accessorKey: "status",
        header: "وضعیت",
        cell: ({ getValue }) => STATUS_LABELS[String(getValue())] ?? String(getValue()),
        filterFn: (row, _id, value) =>
          !value || String(row.original.status) === String(value),
        meta: {
          filterComponent: ({ value, onFilterChange }) => (
            <select
              className="h-9 w-full rounded-xl border border-[#e4e4e7] px-3 text-sm"
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onFilterChange(e.target.value || null)}
            >
              <option value="">همه</option>
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          ),
        },
      },
      {
        accessorKey: "payment_method",
        header: "پرداخت",
        cell: ({ getValue }) =>
          getValue() === "cash" ? "نقدی" : "آنلاین",
      },
      {
        accessorKey: "total",
        header: "مبلغ",
        cell: ({ getValue }) => (
          <span className="font-medium">{formatPrice(Number(getValue()))}</span>
        ),
      },
    ],
    [],
  );

  return (
    <AdminShell title="گزارشات مالی" subtitle="درآمد، سفارش‌ها و موجودی">
      {isLoading && <p className="text-[#71717a]">بارگذاری گزارش…</p>}
      {error && <p className="text-red-600">{error.message}</p>}

      {report && (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="درآمد تحویل‌شده"
              value={formatPrice(report.deliveredRevenue)}
              sub={`${report.deliveredCount} سفارش`}
            />
            <StatCard
              label="درآمد در انتظار"
              value={formatPrice(report.pendingRevenue)}
              sub={`${report.pendingCount} سفارش فعال`}
            />
            <StatCard
              label="پرداخت نقدی"
              value={formatPrice(report.cashRevenue)}
            />
            <StatCard
              label="پرداخت آنلاین"
              value={formatPrice(report.onlineRevenue)}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold">درآمد ۱۴ روز اخیر</h2>
              {report.revenueByDay.length === 0 ? (
                <p className="text-sm text-[#71717a]">داده‌ای موجود نیست</p>
              ) : (
                <ul className="space-y-2">
                  {report.revenueByDay.map((day) => (
                    <li key={day.date} className="flex justify-between text-sm">
                      <span className="text-[#71717a]">{day.date}</span>
                      <span className="font-medium">{formatPrice(day.total)}</span>
                      <span className="text-[#71717a]">{day.count} سفارش</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-semibold">موجودی کم</h2>
                <Link href="/dashboard/products" className="text-xs text-[#527559]">
                  مدیریت محصولات
                </Link>
              </div>
              {report.lowStockProducts.length === 0 ? (
                <p className="text-sm text-[#71717a]">همه محصولات موجودی کافی دارند</p>
              ) : (
                <ul className="space-y-2">
                  {report.lowStockProducts.map((p) => (
                    <li key={p.id} className="flex justify-between rounded-xl bg-[#f4f4f5] px-3 py-2 text-sm">
                      <span>{p.name}</span>
                      <span className={p.stock === 0 ? "text-red-600 font-medium" : "text-amber-700"}>
                        {p.stock} عدد
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-semibold">آخرین سفارش‌ها</h2>
            <DataTable
              data={report.recentOrders}
              columns={orderColumns}
              entityName="سفارش‌ها"
              isLoading={isLoading}
              onRefresh={() => void refetch()}
              columnSizingStorageKey="admin-recent-orders"
              enableColumnResizing={false}
              onExport={async () =>
                report.recentOrders.map((order) => ({
                  شناسه: order.id.slice(0, 8),
                  تاریخ: new Date(order.created_at).toLocaleDateString("fa-IR"),
                  وضعیت: STATUS_LABELS[order.status] ?? order.status,
                  پرداخت: order.payment_method === "cash" ? "نقدی" : "آنلاین",
                  مبلغ: order.total,
                }))
              }
            />
          </section>
        </div>
      )}
    </AdminShell>
  );
}
