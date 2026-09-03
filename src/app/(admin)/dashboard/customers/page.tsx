"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import {
  getAdminCustomersAction,
  type AdminCustomer,
} from "@/app/_actions/customer-actions";
import { DataTable } from "@/components/table";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";

export default function AdminCustomersPage() {
  const { t, locale } = useTranslations();

  const { data, isPending, error, refetch } = useQuery({
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
        header: t("admin.customers.colName"),
        cell: ({ row }) => row.original.full_name || t("account.defaultUser"),
      },
      {
        accessorKey: "phone",
        header: t("admin.customers.colPhone"),
        cell: ({ getValue }) => (
          <span dir="ltr">{String(getValue() ?? "—")}</span>
        ),
      },
      {
        accessorKey: "orderCount",
        header: t("admin.customers.colOrders"),
      },
      {
        accessorKey: "spent",
        header: t("admin.customers.colSpent"),
        cell: ({ getValue }) => <Price amount={Number(getValue())} />,
      },
      {
        accessorKey: "created_at",
        header: t("admin.customers.colJoined"),
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString(getNumberLocale(locale)),
      },
    ],
    [t, locale],
  );

  return (
    <AdminShell title={t("admin.customers.title")} subtitle={t("admin.customers.subtitle")}>
      {error && <p className="mb-4 text-red-600">{error.message}</p>}
      <DataTable
        data={data ?? []}
        columns={columns}
        entityName={t("admin.customers.entityName")}
        isSkeleton={isPending}
        onRefresh={() => void refetch()}
        columnSizingStorageKey="admin-customers"
        onExport={async () =>
          (data ?? []).map((row) => ({
            name: row.full_name,
            phone: row.phone,
            orders: row.orderCount,
            spent: row.spent,
            joined: row.created_at,
          }))
        }
      />
      {!isPending && data?.length === 0 && (
        <p className="mt-4 text-sm text-[#71717a]">{t("admin.customers.empty")}</p>
      )}
    </AdminShell>
  );
}
