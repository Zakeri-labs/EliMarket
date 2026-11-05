"use client";

import { KpiRow, PersonCell } from "@/app/(admin)/_components/KpiCards";
import { OMAN_TIME_ZONE, omanYmd } from "@/config/oman-time";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus } from "lucide-react";
import {
  approveRiderAction,
  getAdminRidersAction,
  getRiderCandidatesAction,
  registerRiderAction,
  revokeRiderAction,
  type AdminRider,
  type RiderDetailsInput,
} from "@/app/_actions/rider-admin-actions";
import { ListControls, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/table";
import { getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";

const inputClass =
  "w-full rounded-xl border border-input bg-background px-3 py-2.5 outline-none focus:border-accent";

const EMPTY_FORM: RiderDetailsInput = {
  firstName: "",
  lastName: "",
  civilId: "",
  phone: "",
  addressLine: "",
};

export default function AdminRidersPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending } = useFormAction();
  const [formOpen, setFormOpen] = useState(false);
  const [approveTarget, setApproveTarget] = useState<AdminRider | null>(null);
  const [form, setForm] = useState<RiderDetailsInput>(EMPTY_FORM);

  const ridersQuery = useQuery({
    queryKey: ["admin-riders"],
    queryFn: async () => {
      const result = await getAdminRidersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const candidatesQuery = useQuery({
    queryKey: ["admin-rider-candidates"],
    queryFn: async () => {
      const result = await getRiderCandidatesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-riders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-rider-candidates"] });
    void queryClient.invalidateQueries({ queryKey: ["riders"] });
  };

  const closeForm = () => {
    setFormOpen(false);
    setApproveTarget(null);
    setForm(EMPTY_FORM);
  };

  const openRegister = () => {
    setApproveTarget(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openApprove = (candidate: AdminRider) => {
    const parts = (candidate.full_name ?? "").trim().split(/\s+/).filter(Boolean);
    setApproveTarget(candidate);
    setForm({
      firstName: parts[0] ?? "",
      lastName: parts.slice(1).join(" "),
      civilId: "",
      phone: candidate.phone ?? "",
      addressLine: "",
    });
    setFormOpen(true);
  };

  const setField = <K extends keyof RiderDetailsInput>(key: K, value: RiderDetailsInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const riderColumns = useMemo<ColumnDef<AdminRider>[]>(
    () => [
      {
        id: "name",
        meta: { minWidth: 200 },
        header: t("admin.riders.colName"),
        cell: ({ row }) => {
          const d = row.original.details;
          return (
            <PersonCell
              name={d ? `${d.first_name} ${d.last_name}` : row.original.full_name || t("account.defaultUser")}
            />
          );
        },
      },
      {
        id: "civilId",
        meta: { minWidth: 120 },
        header: t("admin.riders.colCivilId"),
        cell: ({ row }) => (
          <span dir="ltr">{row.original.details?.civil_id ?? "—"}</span>
        ),
      },
      {
        accessorKey: "phone",
        meta: { minWidth: 150 },
        header: t("admin.riders.colPhone"),
        cell: ({ row }) => (
          <span dir="ltr">{row.original.details?.phone || row.original.phone || "—"}</span>
        ),
      },
      {
        id: "address",
        meta: { minWidth: 200 },
        header: t("admin.riders.colAddress"),
        cell: ({ row }) => (
          <span className="line-clamp-2 max-w-[16rem] text-xs">
            {row.original.details?.address_line ?? "—"}
          </span>
        ),
      },
      {
        accessorKey: "created_at",
        meta: { minWidth: 110 },
        header: t("admin.riders.colJoined"),
        cell: ({ getValue }) =>
          new Date(String(getValue())).toLocaleDateString(getNumberLocale(locale), { timeZone: OMAN_TIME_ZONE }),
      },
      {
        id: "actions",
        meta: { minWidth: 150 },
        header: t("admin.riders.colActions"),
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            loading={isPending}
            loadingLabel={t("common.saving")}
            onClick={() =>
              runAction(() => revokeRiderAction(row.original.id), {
                successMessage: t("notifications.riderRevoked"),
                onSuccess: invalidate,
              })
            }
          >
            {t("admin.riders.revoke")}
          </Button>
        ),
      },
    ],
    [t, locale, isPending, runAction],
  );

  const modalTitle = approveTarget
    ? t("admin.riders.approveTitle")
    : t("admin.riders.registerTitle");

  const candidateList = useListControls(candidatesQuery.data ?? []);

  return (
    <AdminShell
      actions={
        <>
        <Button type="button" onClick={openRegister}>
          <AppIcon icon={Plus} size="sm" />
          {t("admin.riders.register")}
        </Button>
        </>
      } title={t("admin.riders.title")} subtitle={t("admin.riders.subtitle")}>
      <KpiRow
        items={[{ label: t("adminUi.activeRiders"), value: ridersQuery.data?.length, icon: "bike", tone: "teal" },
{ label: t("adminUi.candidates"), value: candidatesQuery.data?.length, icon: "clock", tone: "amber" },
{ label: t("adminUi.recentRegistered"), value: ridersQuery.data?.filter((r) => omanYmd(new Date(r.created_at)).slice(0, 7) === omanYmd().slice(0, 7)).length, icon: "userPlus", tone: "sky" },]}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          {t("admin.riders.listTitle")}
        </h2>
        {ridersQuery.error ? (
          <ListError error={ridersQuery.error} onRetry={() => void ridersQuery.refetch()} />
        ) : null}
        <DataTable
          hidden={Boolean(ridersQuery.error) && !ridersQuery.data}
          data={ridersQuery.data ?? []}
          columns={riderColumns}
          entityName={t("admin.riders.entityName")}
          isSkeleton={ridersQuery.isPending}
          onRefresh={() => void ridersQuery.refetch()}
        />
      </section>

      <section>
        <h2 className="mb-1 text-base font-semibold text-foreground">
          {t("admin.riders.approveTitle")}
        </h2>
        <p className="mb-3 text-sm text-muted">{t("admin.riders.approveHint")}</p>
        {candidatesQuery.error ? (
          <ListError error={candidatesQuery.error} onRetry={() => void candidatesQuery.refetch()} />
        ) : null}
        <ListControls list={candidateList} entity={t("admin.riders.title")} />
        {candidatesQuery.error && !candidatesQuery.data ? null : candidatesQuery.isPending ? (
          <p className="text-sm text-muted">{t("common.loading")}</p>
        ) : !candidatesQuery.data?.length ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-sm text-muted">
            {t("admin.riders.approveEmpty")}
          </p>
        ) : (
          <ul className="space-y-2">
            {candidateList.visible.map((candidate) => (
              <li
                key={candidate.id}
                className="flex flex-wrap items-center justify-between gap-3 admin-card px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {candidate.full_name || t("account.defaultUser")}
                  </p>
                  <p className="text-xs text-muted" dir="ltr">
                    {candidate.phone}
                  </p>
                </div>
                <Button type="button" size="sm" onClick={() => openApprove(candidate)}>
                  {t("admin.riders.approve")}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal
        open={formOpen}
        onOpenChange={(open) => {
          if (open) setFormOpen(true);
          else closeForm();
        }}
        title={modalTitle}
        description={
          approveTarget ? t("admin.riders.approveFormHint") : t("admin.riders.registerHint")
        }
        size="md"
        busy={isPending}
        busyLabel={t("common.saving")}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={closeForm} disabled={isPending}>
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              form="admin-rider-register-form"
              loading={isPending}
              loadingLabel={t("common.saving")}
            >
              {approveTarget ? t("admin.riders.approve") : t("admin.riders.register")}
            </Button>
          </>
        }
      >
        <form
          id="admin-rider-register-form"
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (approveTarget) {
              runAction(() => approveRiderAction(approveTarget.id, form), {
                successMessage: t("notifications.riderApproved"),
                onSuccess: () => {
                  closeForm();
                  invalidate();
                },
              });
            } else {
              runAction(() => registerRiderAction(form), {
                successMessage: t("notifications.riderRegistered"),
                onSuccess: () => {
                  closeForm();
                  invalidate();
                },
              });
            }
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs text-muted">
                {t("admin.riders.firstName")}
              </label>
              <input
                value={form.firstName}
                onChange={(e) => setField("firstName", e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                {t("admin.riders.lastName")}
              </label>
              <input
                value={form.lastName}
                onChange={(e) => setField("lastName", e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              {t("admin.riders.civilId")}
            </label>
            <input
              value={form.civilId}
              onChange={(e) => setField("civilId", e.target.value)}
              placeholder={t("admin.riders.civilIdPlaceholder")}
              className={inputClass}
              dir="ltr"
              required
            />
            <p className="mt-1 text-xs text-muted">{t("admin.riders.civilIdHint")}</p>
          </div>
          <div>
            <div>
              <label className="mb-1 block text-xs text-muted">
                {t("admin.riders.phone")}
              </label>
              <input
                value={form.phone}
                onChange={(e) => setField("phone", e.target.value)}
                placeholder={t("admin.riders.phonePlaceholder")}
                className={inputClass}
                dir="ltr"
                required
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-muted">
              {t("admin.riders.address")}
            </label>
            <textarea
              value={form.addressLine}
              onChange={(e) => setField("addressLine", e.target.value)}
              placeholder={t("admin.riders.addressPlaceholder")}
              className={`${inputClass} min-h-[5rem] resize-y`}
              required
            />
          </div>
        </form>
      </Modal>
    </AdminShell>
  );
}
