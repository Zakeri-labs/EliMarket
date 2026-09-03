"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { AlertTriangle, ShoppingBag } from "lucide-react";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";
import { ProductDetailExtrasToggle } from "@/app/(admin)/_components/ProductDetailExtrasToggle";
import { CashSurchargeSetting } from "@/app/(admin)/_components/CashSurchargeSetting";
import { ReceiptSettings } from "@/app/(admin)/_components/ReceiptSettings";
import { DashboardCharts } from "@/app/(admin)/dashboard/_components/DashboardCharts";
import { useFinancialReport } from "@/app/(admin)/dashboard/_hooks/use-financial-report";
import { AppIcon } from "@/components/icons/AppIcon";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";
import { cn } from "@/app/utils/cn";
import type { PeriodSummary } from "@/app/_actions/report-actions";

function StatCard({
  label,
  value,
  sub,
  tone = "default",
}: {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: "default" | "warn" | "danger";
}) {
  return (
    <div className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#71717a]">{label}</p>
      <p
        className={cn(
          "mt-2 text-2xl font-bold",
          tone === "danger" && "text-red-600",
          tone === "warn" && "text-amber-700",
          tone === "default" && "text-[#0f766e]",
        )}
      >
        {value}
      </p>
      {sub ? <p className="mt-1 text-xs text-[#71717a]">{sub}</p> : null}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { t, locale } = useTranslations();
  const { data: report, isPending, error } = useFinancialReport();

  const periodCard = (label: string, summary?: PeriodSummary) => (
    <StatCard
      label={label}
      value={<Price amount={summary?.revenue ?? 0} />}
      sub={t("admin.reports.ordersCount", { count: summary?.orders ?? 0 })}
    />
  );

  return (
    <AdminShell title={t("admin.dashboard.title")} subtitle={t("admin.dashboard.subtitle")}>
      <div className="space-y-8">
        {isPending ? (
          <p className="text-sm text-[#71717a]">{t("admin.reports.loading")}</p>
        ) : null}
        {error ? <p className="text-sm text-red-600">{error.message}</p> : null}

        {report ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              {periodCard(t("admin.dashboard.salesToday"), report.today)}
              {periodCard(t("admin.dashboard.salesWeek"), report.week)}
              {periodCard(t("admin.dashboard.salesMonth"), report.month)}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label={t("admin.dashboard.activeOrders")}
                value={String(report.pendingCount)}
                sub={<Price amount={report.pendingRevenue} />}
              />
              <StatCard
                label={t("admin.dashboard.lowStockTitle")}
                value={String(report.inventory.lowStock)}
                sub={t("admin.dashboard.activeProducts", { count: report.inventory.active })}
                tone={report.inventory.lowStock > 0 ? "warn" : "default"}
              />
              <StatCard
                label={t("admin.dashboard.outOfStock")}
                value={String(report.inventory.outOfStock)}
                sub={t("admin.dashboard.inventory")}
                tone={report.inventory.outOfStock > 0 ? "danger" : "default"}
              />
              <StatCard
                label={t("admin.dashboard.liveCampaigns")}
                value={String(report.liveCampaigns)}
              />
            </div>

            <DashboardCharts report={report} />

            <div className="grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-[#18181b]">
                    <AppIcon icon={AlertTriangle} size="sm" className="text-amber-600" />
                    {t("admin.dashboard.lowStockTitle")}
                  </h2>
                  <Link href="/dashboard/products" className="text-xs text-[#0f766e]">
                    {t("admin.dashboard.viewProducts")}
                  </Link>
                </div>
                {report.lowStockProducts.length === 0 ? (
                  <p className="text-sm text-[#71717a]">{t("admin.reports.allStockOk")}</p>
                ) : (
                  <ul className="space-y-2">
                    {report.lowStockProducts.map((product) => (
                      <li
                        key={product.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[#f4f4f5] px-3 py-2 text-sm"
                      >
                        <span className="min-w-0 truncate">{product.name}</span>
                        <span
                          className={cn(
                            "shrink-0 font-medium",
                            product.stock <= 0 ? "text-red-600" : "text-amber-700",
                          )}
                        >
                          {product.stock} / {product.low_stock_threshold ?? 5}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>

              <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 font-semibold text-[#18181b]">
                    <AppIcon icon={ShoppingBag} size="sm" className="text-[#0d9488]" />
                    {t("admin.reports.recentOrders")}
                  </h2>
                  <Link href="/dashboard/orders" className="text-xs text-[#0f766e]">
                    {t("admin.dashboard.viewOrders")}
                  </Link>
                </div>
                {report.recentOrders.length === 0 ? (
                  <p className="text-sm text-[#71717a]">{t("admin.reports.noData")}</p>
                ) : (
                  <ul className="space-y-2">
                    {report.recentOrders.map((order) => (
                      <li
                        key={order.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[#f4f4f5] px-3 py-2 text-sm"
                      >
                        <span className="font-mono text-xs text-[#71717a]" dir="ltr">
                          {order.id.slice(0, 8)}
                        </span>
                        <span>{t(`admin.status.${order.status}`)}</span>
                        <span className="text-[#71717a]">
                          {new Date(order.created_at).toLocaleString(getNumberLocale(locale), {
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

        <div className="space-y-4 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <PriceVisibilityToggle />
          <ProductDetailExtrasToggle />
          <div className="border-t border-[#e4e4e7] pt-4">
            <CashSurchargeSetting />
          </div>
          <div className="border-t border-[#e4e4e7] pt-4">
            <ReceiptSettings />
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
