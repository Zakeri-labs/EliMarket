"use client";

import { KpiRow } from "@/app/(admin)/_components/KpiCards";
import { OMAN_TIME_ZONE, toOmanInput } from "@/config/oman-time";
import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import {
  createCampaignAction,
  deleteCampaignAction,
  getAdminCampaignsAction,
  updateCampaignAction,
} from "@/app/_actions/campaign-actions";
import { DatePicker } from "@/components/ui/DatePicker";
import { ListControls, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { useAdminProducts } from "@/app/(admin)/dashboard/_hooks/use-admin-products";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { AppIcon } from "@/components/icons/AppIcon";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  useAdminImageUpload,
} from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";
import type { Campaign, CampaignType } from "@/app/_types/database.types";
import { Select } from "@/components/ui/Select";

type FormState = {
  name: string;
  badge: string;
  type: CampaignType;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  show_on_home: boolean;
  banner_image_url: string;
  banner_blur_hash: string;
  product_ids: string[];
};

function toLocalInput(iso?: string) {
  return toOmanInput(iso ?? new Date());
}

function defaultWindow(): Pick<FormState, "starts_at" | "ends_at"> {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    starts_at: toLocalInput(start.toISOString()),
    ends_at: toLocalInput(end.toISOString()),
  };
}

function emptyForm(): FormState {
  return {
    name: "",
    badge: "",
    type: "percent",
    discount_value: 10,
    is_active: true,
    show_on_home: true,
    banner_image_url: "",
    banner_blur_hash: "",
    product_ids: [],
    ...defaultWindow(),
  };
}

function campaignToForm(campaign: Campaign): FormState {
  return {
    name: campaign.name,
    badge: campaign.badge ?? "",
    type: campaign.type,
    discount_value: Number(campaign.discount_value),
    starts_at: toLocalInput(campaign.starts_at),
    ends_at: toLocalInput(campaign.ends_at),
    is_active: campaign.is_active,
    show_on_home: campaign.show_on_home,
    banner_image_url: campaign.banner_image_url ?? "",
    banner_blur_hash: campaign.banner_blur_hash ?? "",
    product_ids: (campaign.products ?? []).map((row) => row.product_id),
  };
}

function campaignStatus(campaign: Campaign) {
  const now = Date.now();
  if (!campaign.is_active) return "inactive" as const;
  if (now < new Date(campaign.starts_at).getTime()) return "scheduled" as const;
  if (now >= new Date(campaign.ends_at).getTime()) return "ended" as const;
  return "live" as const;
}

export default function AdminCampaignsPage() {
  const { t, locale } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const { data: products } = useAdminProducts();
  const [editing, setEditing] = useState<Campaign | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [productQuery, setProductQuery] = useState("");

  const { data: campaigns, isPending, error: loadError } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const result = await getAdminCampaignsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
    void queryClient.invalidateQueries({ queryKey: ["products"] });
    void queryClient.invalidateQueries({ queryKey: ["hero-banners"] });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm());
    setProductQuery("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setFormOpen(true);
  };

  const save = () => {
    const payload = {
      name: form.name,
      type: form.type,
      discount_value: form.discount_value,
      starts_at:
        editing && form.starts_at === toLocalInput(editing.starts_at) ? editing.starts_at : form.starts_at,
      ends_at:
        editing && form.ends_at === toLocalInput(editing.ends_at) ? editing.ends_at : form.ends_at,
      is_active: form.is_active,
      show_on_home: form.show_on_home,
      badge: form.badge,
      banner_image_url: form.banner_image_url,
      banner_blur_hash: form.banner_blur_hash,
      product_ids: form.product_ids,
    };
    if (editing) {
      runAction(() => updateCampaignAction(editing.id, payload), {
        successMessage: t("notifications.campaignUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createCampaignAction(payload), {
        successMessage: t("notifications.campaignCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  };

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return (products ?? []).filter((product) => {
      if (!product.is_active) return false;
      if (!q) return true;
      return product.name.toLowerCase().includes(q) || product.slug.toLowerCase().includes(q);
    });
  }, [products, productQuery]);

  const dateLabel = (iso: string) =>
    new Date(iso).toLocaleString(locale === "en" ? "en-GB" : locale === "ar" ? "ar-OM" : "fa-IR", {
 timeZone: OMAN_TIME_ZONE,
      dateStyle: "short",
      timeStyle: "short",
    });

  const inputClass = "w-full rounded-xl border border-input px-3 py-2.5";

  const list = useListControls(campaigns ?? []);

  return (
    <AdminShell
      actions={
        <>
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
          >
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.campaigns.newCampaign")}
          </Button>
        </>
      } title={t("admin.campaigns.title")} subtitle={t("admin.campaigns.subtitle")}>
      <KpiRow
        items={[{ label: t("adminUi.total"), value: campaigns?.length, icon: "percent", tone: "teal" },
{ label: t("adminUi.live"), value: campaigns?.filter((c) => campaignStatus(c) === "live").length, icon: "check", tone: "sky" },
{ label: t("adminUi.scheduled"), value: campaigns?.filter((c) => campaignStatus(c) === "scheduled").length, icon: "calendar", tone: "amber" },
{ label: t("adminUi.ended"), value: campaigns?.filter((c) => campaignStatus(c) === "ended").length, icon: "x", tone: "slate" },]}
      />
      <div className="space-y-4">

        {loadError ? <ListError error={loadError} onRetry={() => void refetch()} /> : null}
        <ListControls list={list} entity={t("admin.campaigns.title")} />
        {loadError && !campaigns ? null : isPending ? (
          <div className="skeleton space-y-3" aria-busy="true" aria-label={t("admin.campaigns.loading")}>
            {[0, 1, 2].map((key) => (
              <div key={key} className="target h-24 rounded-[var(--card-radius)]" />
            ))}
          </div>
        ) : campaigns?.length ? (
          <ul className="space-y-3">
            {list.visible.map((campaign) => {
              const status = campaignStatus(campaign);
              return (
                <li
                  key={campaign.id}
                  className="flex flex-wrap items-start justify-between gap-3 admin-card p-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {campaign.banner_image_url ? (
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-border bg-background">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={campaign.banner_image_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : null}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold text-foreground">{campaign.name}</h2>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-xs font-medium",
                            status === "live" && "bg-emerald-100 text-emerald-800",
                            status === "scheduled" && "bg-amber-100 text-amber-800",
                            status === "ended" && "bg-background text-muted",
                            status === "inactive" && "bg-red-50 text-red-700",
                          )}
                        >
                          {t(`admin.campaigns.status.${status}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {campaign.type === "percent"
                          ? t("admin.campaigns.percentOff", { value: campaign.discount_value })
                          : t("admin.campaigns.fixedOff", { value: campaign.discount_value })}
                        {" · "}
                        {t("admin.campaigns.productCount", {
                          count: campaign.products?.length ?? 0,
                        })}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {dateLabel(campaign.starts_at)} — {dateLabel(campaign.ends_at)}
                      </p>
                    </div>
                  </div>
                  <RowIconActions
                    editLabel={t("admin.campaigns.edit")}
                    deleteLabel={t("admin.campaigns.delete")}
                    onEdit={() => {
                      setEditing(campaign);
                      setForm(campaignToForm(campaign));
                      setFormOpen(true);
                    }}
                    onDelete={() =>
                      runAction(() => deleteCampaignAction(campaign.id), {
                        successMessage: t("notifications.campaignDeleted"),
                        onSuccess: refetch,
                      })
                    }
                  />
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-border bg-white px-4 py-10 text-center text-sm text-muted">
            {t("admin.campaigns.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.campaigns.editCampaign") : t("admin.campaigns.newCampaign")}
          size="lg"
          busy={isActionPending || isUploadPending}
          busyLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending || isUploadPending}>
                {t("admin.campaigns.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-campaign-form"
                loading={isActionPending || isUploadPending}
                loadingLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
              >
                {editing ? t("admin.campaigns.save") : t("admin.campaigns.create")}
              </Button>
            </>
          }
        >
          <form
            id="admin-campaign-form"
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              className={inputClass}
              placeholder={t("admin.campaigns.namePlaceholder")}
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
              required
            />
            <input
              className={inputClass}
              placeholder={t("admin.campaigns.badgePlaceholder")}
              value={form.badge}
              onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
            />

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted">{t("admin.campaigns.bannerLabel")}</p>
              <p className="text-xs text-muted">{t("admin.campaigns.bannerHint")}</p>
              {form.banner_image_url ? (
                <div className="overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.banner_image_url}
                    alt=""
                    className="aspect-[16/7] w-full object-cover"
                  />
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                <label className="cursor-pointer">
                  <span className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm">
                    <AppIcon icon={Upload} size="sm" />
                    {t("admin.campaigns.uploadImage")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
                        notifyFormError(t("errors.fileTooLarge"), {
                          title: t("notifications.errorTitle"),
                        });
                        e.target.value = "";
                        return;
                      }
                      uploadImage(file, "hero", {
                        successMessage: t("notifications.imageUploaded"),
                        onSuccess: (data) => {
                          if (!data) return;
                          setForm((s) => ({
                            ...s,
                            banner_image_url: data.url || s.banner_image_url,
                            banner_blur_hash: data.blurHash || s.banner_blur_hash,
                          }));
                        },
                      });
                      e.target.value = "";
                    }}
                  />
                </label>
                {form.banner_image_url ? (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setForm((s) => ({ ...s, banner_image_url: "", banner_blur_hash: "" }))}
                  >
                    {t("admin.campaigns.removeImage")}
                  </Button>
                ) : null}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-muted">
                {t("admin.campaigns.typeLabel")}
                <Select className="mt-1"
                  value={form.type}
                  onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as CampaignType }))}
                >
                  <option value="percent">{t("admin.campaigns.typePercent")}</option>
                  <option value="fixed">{t("admin.campaigns.typeFixed")}</option>
                </Select>
              </label>
              <label className="block text-xs text-muted">
                {t("admin.campaigns.valueLabel")}
                <input
                  className="mt-1"
                  type="number"
                  min={0.001}
                  step={form.type === "percent" ? 1 : 0.001}
                  max={form.type === "percent" ? 90 : undefined}
                  value={form.discount_value}
                  onChange={(e) => {
                    const raw = Number(e.target.value);
                    setForm((s) => ({
                      ...s,
                      discount_value: s.type === "percent" ? Math.round(raw) : raw,
                    }));
                  }}
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="block text-xs text-muted">
                {t("admin.campaigns.startsAt")}
                <div className="mt-1"><DatePicker withTime aria-label={t("admin.campaigns.startsAt")} value={form.starts_at} onChange={(next) => setForm((s) => ({ ...s, starts_at: next }))} /></div>
              </div>
              <div className="block text-xs text-muted">
                {t("admin.campaigns.endsAt")}
                <div className="mt-1"><DatePicker withTime aria-label={t("admin.campaigns.endsAt")} value={form.ends_at} onChange={(next) => setForm((s) => ({ ...s, ends_at: next }))} /></div>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
              />
              {t("admin.campaigns.activeLabel")}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.show_on_home}
                onChange={(e) => setForm((s) => ({ ...s, show_on_home: e.target.checked }))}
              />
              {t("admin.campaigns.homeLabel")}
            </label>

            <div>
              <p className="mb-1 text-xs font-medium text-muted">{t("admin.campaigns.productsLabel")}</p>
              <input
                className={`${inputClass} mb-2`}
                placeholder={t("admin.campaigns.productSearch")}
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-border p-2">
                {filteredProducts.map((product) => {
                  const checked = form.product_ids.includes(product.id);
                  return (
                    <label key={product.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-background">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          setForm((s) => ({
                            ...s,
                            product_ids: checked
                              ? s.product_ids.filter((id) => id !== product.id)
                              : [...s.product_ids, product.id],
                          }))
                        }
                      />
                      <span className="min-w-0 truncate">{product.name}</span>
                    </label>
                  );
                })}
                {!filteredProducts.length && (
                  <p className="px-2 py-3 text-xs text-muted">{t("admin.campaigns.noProducts")}</p>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">
                {t("admin.campaigns.selectedCount", { count: form.product_ids.length })}
              </p>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
