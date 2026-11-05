"use client";

import { resolveLocalizedName } from "@/lib/i18n/product-name";
import { omanYmd } from "@/config/oman-time";
import { useMemo, useRef, useState, type ReactElement } from "react";
import { useInView, useReducedMotion } from "motion/react";
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
  Sector,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { FinancialReport, PeriodBucket } from "@/app/_actions/report-actions";
import { getNumberLocale, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import { Select } from "@/components/ui/Select";

const SAGE = "#0f766e";
const SAGE_DARK = "#115e59";
const AMBER = "#d97706";
const RED = "#dc2626";
const MUTED = "#5c6b6b";
const GRID = "#e4e9e9";

// Hovered slices grow slightly so the active value is obvious.
function ActiveSlice(props: React.ComponentProps<typeof Sector>) {
  return <Sector {...props} outerRadius={Number(props.outerRadius ?? 0) + 6} />;
}

type PeriodKey = "daily" | "weekly" | "monthly";

function fillDaily(buckets: PeriodBucket[], locale: Locale) {
  const map = new Map(buckets.map((row) => [row.period, row]));
  const numberLocale = getNumberLocale(locale);
  const rows: { label: string; total: number; count: number }[] = [];
  const cursor = new Date(`${omanYmd()}T12:00:00Z`);
  for (let i = 13; i >= 0; i -= 1) {
    const day = new Date(cursor);
    day.setUTCDate(cursor.getUTCDate() - i);
    const key = day.toISOString().slice(0, 10);
    const hit = map.get(key);
    rows.push({
      label: day.toLocaleDateString(`${numberLocale}-u-ca-gregory`, { timeZone: "UTC", month: "numeric", day: "numeric" }),
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

// Mounting on first view makes the draw and grow animations visible instead of off screen.
function ChartOnView({ children }: { children: ReactElement }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.3 });
  return (
    <div ref={ref} className="h-full w-full">
      {inView ? (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      ) : null}
    </div>
  );
}

function truncateName(name: string, max = 18) {
  return name.length > max ? `${name.slice(0, max)}…` : name;
}

export function DashboardCharts({ report }: { report: FinancialReport }) {
  const { t, locale } = useTranslations();
  const [period, setPeriod] = useState<PeriodKey>("daily");
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;

  const salesData = useMemo(() => {
    if (period === "weekly") return chronological(report.revenueByWeek);
    if (period === "monthly") return chronological(report.revenueByMonth);
    return fillDaily(report.revenueByDay, locale);
  }, [locale, period, report.revenueByDay, report.revenueByMonth, report.revenueByWeek]);

  const topSellerData = useMemo(
    () =>
      [...report.topSellers].reverse().map((item) => ({
        name: truncateName(resolveLocalizedName(item, locale)),
        fullName: resolveLocalizedName(item, locale),
        quantity: item.quantity,
        revenue: item.revenue,
      })),
    [report.topSellers, locale],
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
    border: "none",
    boxShadow: "0 12px 30px -8px rgba(15, 24, 32, 0.25)",
    fontSize: 12,
  };

  return (
    <div className="space-y-6">
      <section className="admin-card p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-foreground">{t("admin.dashboard.salesTrend")}</h2>
          <Select
            aria-label={t("adminUi.period")}
            className="!w-auto"
            value={period}
            onChange={(event) => setPeriod(event.target.value as PeriodKey)}
          >
            <option value="daily">{t("admin.reports.daily")}</option>
            <option value="weekly">{t("admin.reports.weekly")}</option>
            <option value="monthly">{t("admin.reports.monthly")}</option>
          </Select>
        </div>
        {salesData.every((row) => row.total === 0 && row.count === 0) ? (
          <p className="py-10 text-center text-sm text-muted">{t("admin.reports.noData")}</p>
        ) : (
          <div className="h-72 w-full" dir="ltr">
            <ChartOnView>
              <AreaChart data={salesData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={SAGE} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={SAGE} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
                <XAxis dataKey="label" tick={{ fill: MUTED, fontSize: 12 }} />
                <YAxis tick={{ fill: MUTED, fontSize: 12 }} width={48} />
                <Tooltip
                  isAnimationActive={animate}
                  animationDuration={180}
                  contentStyle={tooltipStyle}
                  formatter={(value, name) =>
                    name === "total"
                      ? [<Price key="v" amount={Number(value)} />, t("admin.dashboard.chartRevenue")]
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
                  isAnimationActive={animate}
                  animationDuration={1400}
                  activeDot={{ r: 6, strokeWidth: 2, stroke: "#ffffff" }}
                />
              </AreaChart>
            </ChartOnView>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="admin-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">{t("admin.dashboard.topSellers")}</h2>
          {topSellerData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              {t("admin.dashboard.topSellersEmpty")}
            </p>
          ) : (
            <div className="h-72 w-full" dir="ltr">
              <ChartOnView>
                <BarChart
                  data={topSellerData}
                  layout="vertical"
                  margin={{ top: 4, right: 12, left: 8, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
                  <XAxis type="number" tick={{ fill: MUTED, fontSize: 12 }} />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={110}
                    tick={{ fill: "#111c1f", fontSize: 12 }}
                  />
                  <Tooltip
                    isAnimationActive={animate}
                    animationDuration={180}
                    contentStyle={tooltipStyle}
                    formatter={(value, name, item) => {
                      const row = item?.payload as { fullName?: string; revenue?: number };
                      if (name === "quantity") {
                        return [
                          <span key="v">
                            {String(value)} · <Price amount={Number(row.revenue ?? 0)} />
                          </span>,
                          row.fullName ?? t("admin.dashboard.soldCount", { count: Number(value) }),
                        ];
                      }
                      return [String(value), String(name)];
                    }}
                  />
                  <Bar dataKey="quantity" fill={SAGE} radius={[0, 6, 6, 0]} name="quantity" isAnimationActive={animate} animationDuration={1100} activeBar={{ fill: SAGE_DARK }} />
                </BarChart>
              </ChartOnView>
            </div>
          )}
        </section>

        <section className="admin-card p-5">
          <h2 className="mb-4 font-semibold text-foreground">{t("admin.dashboard.inventorySplit")}</h2>
          {inventoryData.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">{t("admin.reports.noData")}</p>
          ) : (
            <div className="h-72 w-full" dir="ltr">
              <ChartOnView>
                <PieChart>
                  <Pie
                    data={inventoryData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={58}
                    outerRadius={90}
                    paddingAngle={2}
                    isAnimationActive={animate}
                    activeShape={ActiveSlice}
                  >
                    {inventoryData.map((row) => (
                      <Cell key={row.name} fill={row.color} />
                    ))}
                  </Pie>
                  <Legend formatter={(value) => <span style={{ color: MUTED, fontSize: 12 }}>{value}</span>} />
                  <Tooltip isAnimationActive={animate} animationDuration={180} contentStyle={tooltipStyle} />
                </PieChart>
              </ChartOnView>
            </div>
          )}
        </section>
      </div>

      <section className="admin-card p-5">
        <h2 className="mb-4 font-semibold text-foreground">{t("admin.dashboard.orderStatusChart")}</h2>
        {orderStatusData.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted">{t("admin.reports.noData")}</p>
        ) : (
          <div className="mx-auto h-72 w-full max-w-xl" dir="ltr">
            <ChartOnView>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={90}
                  paddingAngle={2}
                    isAnimationActive={animate}
                    activeShape={ActiveSlice}
                >
                  {orderStatusData.map((row) => (
                    <Cell key={row.name} fill={row.color} />
                  ))}
                </Pie>
                <Legend formatter={(value) => <span style={{ color: MUTED, fontSize: 12 }}>{value}</span>} />
                <Tooltip isAnimationActive={animate} animationDuration={180} contentStyle={tooltipStyle} />
              </PieChart>
            </ChartOnView>
          </div>
        )}
      </section>
    </div>
  );
}
