"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialReport, PeriodBucket } from "@/app/_actions/report-actions";
import { getNumberLocale, type Locale } from "@/i18n/config";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";

const SAGE = "#0d9488";
const SAGE_DARK = "#0f766e";
const AMBER = "#d97706";
const RED = "#dc2626";
const MUTED = "#a1a1aa";

type PeriodKey = "daily" | "weekly" | "monthly";

function fillDaily(buckets: PeriodBucket[], locale: Locale) {
  const map = new Map(buckets.map((row) => [row.period, row]));
  const numberLocale = getNumberLocale(locale);
  const rows: { label: string; total: number; count: number }[] = [];
  const cursor = new Date();
  cursor.setUTCHours(12, 0, 0, 0);
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    const hit = map.get(key);
    rows.push({
      label: day.toLocaleDateString(numberLocale, { month: "numeric", day: "numeric" }),
      total: hit?.total ?? 0,
      count: hit?.count ?? 0,
    });
  }
  return rows;
}

function chronological(buckets: PeriodBucket[]) {
  return [...buckets].reverse().map((row) => ({
    label: row.period,
    total: row.total,
    count: row.count,
  }));
}

function truncateName(name: string, max = 18) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function DashboardCharts({ report }: { report: FinancialReport }) {
  const { t, locale } = useTranslations();
  const formatPrice = useFormatPrice();
  const [period, setPeriod] = useState<PeriodKey>("daily");

  const salesData = useMemo(() => {
    if (period === "weekly") return chronological(report.revenueByWeek);
    if (period === "monthly") return chronological(report.revenueByMonth);
    return fillDaily(report.revenueByDay, locale);
  }, [locale, period, report.revenueByDay, report.revenueByMonth, report.revenueByWeek]);

  const topSellerData = useMemo(
    () =>
      [...report.topSellers].reverse().map((item) => ({
        name: truncateName(item.name),
        fullName: item.name,
        quantity: item.quantity,
        revenue: item.revenue,
      })),
    [report.topSellers],
  );

  const healthyStock = Math.max(
    0,
    report.inventory.total - report.inventory.lowStock,
  );
  const lowInStock = Math.max(
    0,
    report.inventory.lowStock - report.inventory.outOfStock,
  );

  const inventoryData = [
    { name: t("admin.dashboard.stockOk"), value: healthyStock, color: SAGE },
    { name: t("admin.dashboard.lowStockTitle"), value: lowInStock, color: AMBER },
    { name: t("admin.dashboard.outOfStock"), value: report.inventory.outOfStock, color: RED },
  ].filter((row) => row.value > 0);

  const orderStatusData = [
    { name: t("admin.status.pending"), value: report.pendingCount, color: AMBER },
    { name: t("admin.status.delivered"), value: report.deliveredCount, color: SAGE },
    { name: t("admin.status.cancelled"), value: report.cancelledCount, color: RED },
  ].filter((row) => row.value > 0);

  const tooltipStyle = {
    borderRadius: 12,
    border: "1px solid #e4e4e7",
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-[#18181b]">{t("admin.dashboard.salesTrend")}</h2>
          <select
            className="h-9 rounded-xl border border-[#e4e4e7] px-3 text-sm"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodKey)}
          >
            <option value="daily">{t("admin.reports.daily")}</option>
            <option value="weekly">{t("admin.reports.weekly")}</option>
            <option value="monthly">{t("admin.reports.monthly")}</option>
          </select>
        </div>
        {salesData.every((row) => row.total === 0 && row.count === 0) ? (
          <p className="py-10 text-center text-sm text-[#71717a]">{t("admin.reports.noData")}</p>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SAGE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SAGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 11 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 11 }} width={48} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(value, name) =>
                    name === "total"
                      ? [formatPrice(Number(value)), t("admin.dashboard.chartRevenue")]
                      : [String(value), t("admin.dashboard.chartOrders")]
                  }
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke={SAGE_DARK}
                  strokeWidth={2}
                  fill="url(#salesFill)"
                  name="total"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#18181b]">{t("admin.dashboard.topSellers")}</h2>
          {topSellerData.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#71717a]">
              {t("admin.dashboard.topSellersEmpty")}
            </p>
          ) : (
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topSellerData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" horizontal={false} />
                  <XAxis type="number" tick={{ fill: MUTED, fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: "#3f3f46", fontSize: 11 }}
                  />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(value, name, item) => {
                      const row = item?.payload as { fullName?: string; revenue?: number };
                      if (name === "quantity") {
                        return [
                          `${value} · ${formatPrice(Number(row.revenue ?? 0))}`,
                          row.fullName ?? t("admin.dashboard.soldCount", { count: Number(value) }),
                        ];
                      }
                      return [String(value), String(name)];
                    }}
                  />
                  <Bar dataKey="quantity" fill={SAGE} radius={[0, 6, 6, 0]} name="quantity" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-semibold text-[#18181b]">{t("admin.dashboard.inventorySplit")}</h2>
          {inventoryData.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#71717a]">{t("admin.reports.noData")}</p>
          ) : (
            <div className="h-72 w-full" dir="ltr">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                  >
                    {inventoryData.map((row) => (
                      <Cell key={row.name} fill={row.color} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-[#18181b]">{t("admin.dashboard.orderStatusChart")}</h2>
        {orderStatusData.length === 0 ? (
          <p className="py-10 text-center text-sm text-[#71717a]">{t("admin.reports.noData")}</p>
        ) : (
          <div className="mx-auto h-72 w-full max-w-xl" dir="ltr">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {orderStatusData.map((row) => (
                    <Cell key={row.name} fill={row.color} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>
    </div>
  );
}
