"use client";

import { KpiRow, PersonCell } from "@/app/(admin)/_components/KpiCards";
import { omanYmd, formatOmanDate } from "@/config/oman-time";
import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { ListError } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import {
  getAdminCustomersAction,
  type AdminCustomer,
} from "@/app/_actions/customer-actions";
import { DataTable } from "@/components/table";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";

export default function AdminCustomersPage() {
  const { t, locale } = useTranslations();

  const { data, isPending, error, refetch, refetch: refetchCustomers } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const result = await getAdminCustomersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const columns = useMemo<ColumnDef<AdminCustomer>[]>(
    () => [
      {
        accessorKey: "full_name",
        meta: { minWidth: 220 },
        header: t("admin.customers.colName"),
        cell: ({ row }) => <PersonCell name={row.original.full_name || t("account.defaultUser")} />,
      },
      {
        accessorKey: "phone",
        meta: { minWidth: 150 },
        header: t("admin.customers.colPhone"),
        cell: ({ getValue }) => (
          <span dir="ltr">{String(getValue() ?? "—")}</span>
        ),
      },
      {
        accessorKey: "orderCount",
        meta: { minWidth: 90 },
        header: t("admin.customers.colOrders"),
      },
      {
        accessorKey: "spent",
        meta: { minWidth: 120 },
        header: t("admin.customers.colSpent"),
        cell: ({ getValue }) => <Price amount={Number(getValue())} />,
      },
      {
        accessorKey: "created_at",
        meta: { minWidth: 120 },
        header: t("admin.customers.colJoined"),
        cell: ({ getValue }) =>
          formatOmanDate(String(getValue()), locale),
      },
    ],
    [t, locale],
  );

  return (
    <AdminShell title={t("admin.customers.title")} subtitle={t("admin.customers.subtitle")}>
      <KpiRow
        hidden={Boolean(error) && !data}
        items={[{ label: t("adminUi.total"), value: data?.length, icon: "users", tone: "teal" },
{ label: t("adminUi.withOrders"), value: data?.filter((c) => c.orderCount > 0).length, icon: "bag", tone: "sky" },
{ label: t("adminUi.newThisMonth"), value: data?.filter((c) => omanYmd(new Date(c.created_at)).slice(0, 7) === omanYmd().slice(0, 7)).length, icon: "userPlus", tone: "amber" },
{ label: t("adminUi.totalSpent"), value: data ? <Price amount={data.reduce((sum, c) => sum + c.spent, 0)} /> : undefined, icon: "wallet", tone: "slate" },]}
      />
      {error && <ListError error={error} onRetry={() => void refetchCustomers()} />}
      <DataTable
        hidden={Boolean(error) && !data}
        data={data ?? []}
        columns={columns}
        entityName={t("admin.customers.entityName")}
        isSkeleton={isPending}
        onRefresh={() => void refetch()}
        onExport={async (rows) =>
          rows.map((row) => ({
            [t("admin.customers.colName")]: row.full_name,
            [t("admin.customers.colPhone")]: row.phone,
            [t("admin.customers.colOrders")]: row.orderCount,
            [t("admin.customers.colSpent")]: row.spent,
            [t("admin.customers.colJoined")]: row.created_at,
          }))
        }
      />
    </AdminShell>
  );
}
