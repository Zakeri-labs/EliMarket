"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { AlertTriangle, ChevronRight, PackagePlus, ShoppingBag, Wallet } from "lucide-react";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { KpiRow, MiniStats } from "@/app/(admin)/_components/KpiCards";
import { subscribeMinute } from "@/app/(admin)/_components/useAdminMotion";
import { ListError } from "@/app/(admin)/_components/ListControls";
import { DashboardCharts } from "@/app/(admin)/dashboard/_components/DashboardCharts";
import { useFinancialReport } from "@/app/(admin)/dashboard/_hooks/use-financial-report";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { Price } from "@/components/ui/Price";
import { OMAN_TIME_ZONE, omanHour } from "@/config/oman-time";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";

const LIST_LIMIT = 5;

function greetingKey() {
  const hour = omanHour();
  if (hour < 12) return "adminUi.greetingMorning";
  if (hour < 17) return "adminUi.greetingAfternoon";
  return "adminUi.greetingEvening";
}

export default function AdminDashboardPage() {
  const { t, locale } = useTranslations();
  const { data: report, isPending, error, refetch } = useFinancialReport();
  // Time-based text is client-only and refreshes while a tab stays open.
  const greeting = useSyncExternalStore(subscribeMinute, greetingKey, () => null);
  const today = useSyncExternalStore(
    subscribeMinute,
    () =>
      new Date().toLocaleDateString(getNumberLocale(locale), {
        timeZone: OMAN_TIME_ZONE,
        dateStyle: "full",
      }),
    () => "",
  );

  return (
    <AdminShell
      eyebrow={<span className="min-h-5">{today}</span>}
      title={
        greeting ? (
          <>
            {t(greeting)} <span className="admin-wave">👋</span>
          </>
        ) : (
          t("admin.dashboard.title")
        )
      }
      subtitle={t("admin.dashboard.subtitle")}
      actions={
        <>
          <Link
            href="/dashboard/products"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-medium text-white transition-colors hover:bg-accent-dark md:min-h-10"
          >
            <AppIcon icon={PackagePlus} size="sm" />
            {t("admin.dashboard.viewProducts")}
          </Link>
          <Link
            href="/dashboard/orders"
            className="inline-flex min-h-11 items-center rounded-xl border border-input bg-card px-5 text-sm font-medium transition-colors hover:bg-accent/10 md:min-h-10"
          >
            {t("admin.dashboard.viewOrders")}
          </Link>
        </>
      }
    >
      <div className="space-y-5">
        <section
          data-reveal
          className="admin-pattern relative overflow-hidden rounded-[var(--card-radius)] bg-[var(--sidebar)] text-white"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/baner/hero-desktop.webp"
            alt=""
            className="admin-kenburns absolute inset-y-0 end-0 hidden h-full w-[45%] object-cover md:block"
          />
          <div className="absolute inset-y-0 end-0 hidden w-[45%] bg-linear-to-r from-[var(--sidebar)] via-[var(--sidebar)]/60 to-transparent md:block rtl:bg-linear-to-l" />
          <div className="relative flex flex-col gap-4 p-5 sm:flex-row sm:items-center md:p-6">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-white/10">
              <AppIcon icon={Wallet} size="md" className="text-teal-200" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-teal-200">{t("adminUi.todaySales")}</p>
              <div className="mt-1 min-h-8 text-2xl font-bold">
                {report ? (
                  <Price amount={report.today.revenue} />
                ) : isPending ? (
                  <span className="block h-8 w-36 animate-pulse rounded-lg bg-white/10" aria-hidden />
                ) : null}
              </div>
              {report ? (
                <p className="mt-0.5 text-sm text-white/75">
                  {t("admin.reports.ordersCount", { count: report.today.orders })}
                </p>
              ) : null}
            </div>
            <Link
              href="/dashboard/reports"
              className="flex min-h-11 shrink-0 items-center gap-1 self-start rounded-xl bg-white px-4 text-sm font-semibold text-[var(--sidebar)] sm:self-center md:min-h-10"
            >
              {t("admin.nav.reports")}
              <AppIcon icon={ChevronRight} size="sm" className="rtl:rotate-180" />
            </Link>
          </div>
        </section>

        {error ? <ListError error={error} onRetry={() => void refetch()} /> : null}

        {error && !report ? null : (
          <>
            <KpiRow
              spacing=""
              items={[
                {
                  label: t("admin.dashboard.salesWeek"),
                  value: report ? <Price amount={report.week.revenue} /> : undefined,
                  sub: report ? t("admin.reports.ordersCount", { count: report.week.orders }) : null,
                  icon: "chart",
                  tone: "teal",
                },
                {
                  label: t("admin.dashboard.salesMonth"),
                  value: report ? <Price amount={report.month.revenue} /> : undefined,
                  sub: report ? t("admin.reports.ordersCount", { count: report.month.orders }) : null,
                  icon: "wallet",
                  tone: "sky",
                },
                {
                  label: t("admin.dashboard.activeOrders"),
                  value: report?.pendingCount,
                  sub: report ? <Price amount={report.pendingRevenue} /> : null,
                  icon: "bag",
                  tone: "amber",
                },
                {
                  label: t("admin.dashboard.lowStockTitle"),
                  value: report?.inventory.lowStock,
                  sub: report
                    ? t("admin.dashboard.activeProducts", { count: report.inventory.active })
                    : null,
                  icon: "alert",
                  tone: "rose",
                },
              ]}
            />
            {report ? (
              <MiniStats
                items={[
                  { label: t("admin.dashboard.outOfStock"), value: report.inventory.outOfStock, icon: "boxOff" },
                  { label: t("admin.dashboard.liveCampaigns"), value: report.liveCampaigns, icon: "percent" },
                  { label: t("adminUi.deliveredOrders"), value: report.deliveredCount, icon: "check" },
                  { label: t("adminUi.cancelledOrders"), value: report.cancelledCount, icon: "x" },
                ]}
              />
            ) : null}
          </>
        )}

        {report ? (
          <>
            <DashboardCharts report={report} />

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="admin-card p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground">
                    <AppIcon icon={AlertTriangle} size="sm" className="text-amber-800" />
                    {t("admin.dashboard.lowStockTitle")}
                  </h2>
                  <Link
                    href="/dashboard/products"
                    className="inline-flex min-h-11 items-center text-xs font-medium text-accent-dark md:min-h-8"
                  >
                    {t("admin.dashboard.viewProducts")}
                  </Link>
                </div>
                {report.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-muted">{t("admin.reports.allStockOk")}</p>
                ) : (
                  <ul className="space-y-2">
                    {report.lowStockProducts.slice(0, LIST_LIMIT).map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-background px-3 py-2.5 text-sm transition-colors hover:bg-accent/10"
                      >
                        <span className="min-w-0 truncate">{product.name}</span>
                        <bdi
                          dir="ltr"
                          className={cn(
                            "shrink-0 font-medium",
                            product.stock <= 0 ? "text-red-700" : "text-amber-800",
                          )}
                        >
                          {product.stock} / {product.low_stock_threshold ?? 5}
                        </bdi>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="admin-card p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-foreground">
                    <AppIcon icon={ShoppingBag} size="sm" className="text-accent" />
                    {t("admin.reports.recentOrders")}
                  </h2>
                  <Link
                    href="/dashboard/orders"
                    className="inline-flex min-h-11 items-center text-xs font-medium text-accent-dark md:min-h-8"
                  >
                    {t("admin.dashboard.viewOrders")}
                  </Link>
                </div>
                {report.recentOrders.length === 0 ? (
                  <p className="text-sm text-muted">{t("admin.reports.noData")}</p>
                ) : (
                  <ul className="space-y-2">
                    {report.recentOrders.slice(0, LIST_LIMIT).map((order) => (
                      <li
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-background px-3 py-2.5 text-sm transition-colors hover:bg-accent/10"
                      >
                        <span className="font-mono text-xs text-muted" dir="ltr">
                          {order.id.slice(0, 8)}
                        </span>
                        <span>{t(`admin.status.${order.status}`)}</span>
                        <span className="text-muted">
                          {new Date(order.created_at).toLocaleString(getNumberLocale(locale), {
                            timeZone: OMAN_TIME_ZONE,
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        <Price amount={Number(order.total)} className="font-medium" />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        ) : null}
      </div>
    </AdminShell>
  );
}
