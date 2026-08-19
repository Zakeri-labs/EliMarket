"use client";

import Link from "next/link";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { PriceVisibilityToggle } from "@/app/(admin)/_components/PriceVisibilityToggle";
import { useTranslations } from "@/i18n/use-translations";

export default function AdminDashboardPage() {
  const { t } = useTranslations();

  const cards = [
    {
      href: "/dashboard/products",
      label: t("admin.dashboard.productsCard"),
      desc: t("admin.dashboard.productsDesc"),
    },
    {
      href: "/dashboard/categories",
      label: t("admin.dashboard.categoriesCard"),
      desc: t("admin.dashboard.categoriesDesc"),
    },
    {
      href: "/dashboard/banners",
      label: t("admin.dashboard.bannersCard"),
      desc: t("admin.dashboard.bannersDesc"),
    },
    {
      href: "/dashboard/orders",
      label: t("admin.dashboard.ordersCard"),
      desc: t("admin.dashboard.ordersDesc"),
    },
    {
      href: "/dashboard/reports",
      label: t("admin.dashboard.reportsCard"),
      desc: t("admin.dashboard.reportsDesc"),
    },
    {
      href: "/dashboard/coverage-area",
      label: t("admin.dashboard.coverageCard"),
      desc: t("admin.dashboard.coverageDesc"),
    },
  ];

  return (
    <AdminShell title={t("admin.dashboard.title")}>
      <div className="mb-8 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
        <PriceVisibilityToggle />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-xl border border-[#e4e4e7] bg-white p-6 shadow-sm transition-colors hover:border-[#6b8f71]"
          >
            <p className="font-semibold text-[#527559]">{item.label}</p>
            <p className="mt-1 text-sm text-[#71717a]">{item.desc}</p>
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
