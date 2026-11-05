"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { KpiRow, PersonCell } from "@/app/(admin)/_components/KpiCards";
import { omanYmd, formatOmanDate } from "@/config/oman-time";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
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
import { ListControls, ListPager, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/table";
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

// Cells read live state from here: rebuilding the columns would remount every row and lose focus.
const RevokeContext = createContext<{
  isPending: boolean;
  revokingId: string | null;
  onRevoke: (rider: AdminRider) => void;
} | null>(null);

function RevokeCell({ rider }: { rider: AdminRider }) {
  const { t } = useTranslations();
  const state = useContext(RevokeContext);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      loading={state?.isPending && state.revokingId === rider.id}
      disabled={state?.isPending}
      loadingLabel={t("common.saving")}
      onClick={() => state?.onRevoke(rider)}
    >
      {t("admin.riders.revoke")}
    </Button>
  );
}

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

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["admin-riders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-rider-candidates"] });
    void queryClient.invalidateQueries({ queryKey: ["riders"] });
  }, [queryClient]);

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

  const [revokeTarget, setRevokeTarget] = useState<AdminRider | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const riderColumns = useMemo<ColumnDef<AdminRider>[]>(
    () => [
      {
        id: "name",
        accessorFn: (rider) =>
          rider.details ? `${rider.details.first_name} ${rider.details.last_name}` : rider.full_name ?? "",
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
        accessorFn: (rider) => rider.details?.civil_id ?? "",
        meta: { minWidth: 120 },
        header: t("admin.riders.colCivilId"),
        cell: ({ row }) => (
          <span dir="ltr">{row.original.details?.civil_id ?? "—"}</span>
        ),
      },
      {
        id: "phone",
        accessorFn: (rider) => rider.details?.phone || rider.phone || "",
        meta: { minWidth: 150 },
        header: t("admin.riders.colPhone"),
        cell: ({ row }) => (
          <span dir="ltr">{row.original.details?.phone || row.original.phone || "—"}</span>
        ),
      },
      {
        id: "address",
        accessorFn: (rider) => rider.details?.address_line ?? "",
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
          formatOmanDate(String(getValue()), locale),
      },
      {
        id: "actions",
        meta: { minWidth: 150 },
        header: t("admin.riders.colActions"),
        cell: ({ row }) => <RevokeCell rider={row.original} />,
      },
    ],
    [t, locale],
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
        hidden={Boolean(ridersQuery.error) && !ridersQuery.data}
        items={[{ label: t("adminUi.activeRiders"), value: ridersQuery.data?.length, icon: "bike", tone: "teal" },
{ label: t("adminUi.candidates"), value: candidatesQuery.error && !candidatesQuery.data ? "—" : candidatesQuery.data?.length, icon: "clock", tone: "amber" },
{ label: t("adminUi.recentRegistered"), value: ridersQuery.data?.filter((r) => omanYmd(new Date(r.created_at)).slice(0, 7) === omanYmd().slice(0, 7)).length, icon: "userPlus", tone: "sky" },]}
      />

      <section className="mb-8">
        <h2 className="mb-3 text-base font-semibold text-foreground">
          {t("admin.riders.listTitle")}
        </h2>
        {ridersQuery.error ? (
          <ListError error={ridersQuery.error} onRetry={() => void ridersQuery.refetch()} />
        ) : null}
        <RevokeContext.Provider value={{ isPending, revokingId, onRevoke: setRevokeTarget }}>
        <DataTable
          hidden={Boolean(ridersQuery.error) && !ridersQuery.data}
          data={ridersQuery.data ?? []}
          columns={riderColumns}
          onExport={async (rows) =>
            rows.map((rider) => ({
              [t("admin.riders.colName")]: rider.details
                ? `${rider.details.first_name} ${rider.details.last_name}`
                : rider.full_name ?? "",
              [t("admin.riders.colCivilId")]: rider.details?.civil_id ?? "",
              [t("admin.riders.colPhone")]: rider.details?.phone || rider.phone || "",
              [t("admin.riders.colAddress")]: rider.details?.address_line ?? "",
              [t("admin.riders.colJoined")]: rider.created_at,
            }))
          }
          entityName={t("admin.riders.entityName")}
          isSkeleton={ridersQuery.isPending}
          onRefresh={() => void ridersQuery.refetch()}
        />
        </RevokeContext.Provider>
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
          <>
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
<ListPager list={candidateList} />
</>
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
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title={t("adminUi.revokeRiderTitle")}
        description={t("adminUi.revokeRiderBody")}
        confirmLabel={t("admin.riders.revoke")}
        cancelLabel={t("common.cancel")}
        onOpenChange={(next) => {
          if (!next) setRevokeTarget(null);
        }}
        onConfirm={() => {
          if (!revokeTarget) return;
          const riderId = revokeTarget.id;
          setRevokeTarget(null);
          setRevokingId(riderId);
          runAction(() => revokeRiderAction(riderId), {
            successMessage: t("notifications.riderRevoked"),
            onSuccess: () => {
              setRevokingId(null);
              invalidate();
            },
            onError: () => setRevokingId(null),
          });
        }}
      />
    </AdminShell>
  );
}
