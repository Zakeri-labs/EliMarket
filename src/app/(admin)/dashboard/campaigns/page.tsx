"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import {
  createCampaignAction,
  deleteCampaignAction,
  getAdminCampaignsAction,
  updateCampaignAction,
} from "@/app/_actions/campaign-actions";
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

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function toLocalInput(iso?: string) {
  const date = iso ? new Date(iso) : new Date();
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
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

  const { data: campaigns, isPending } = useQuery({
    queryKey: ["admin-campaigns"],
    queryFn: async () => {
      const result = await getAdminCampaignsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (!editing) return;
    setForm({
      name: editing.name,
      badge: editing.badge ?? "",
      type: editing.type,
      discount_value: Number(editing.discount_value),
      starts_at: toLocalInput(editing.starts_at),
      ends_at: toLocalInput(editing.ends_at),
      is_active: editing.is_active,
      show_on_home: editing.show_on_home,
      banner_image_url: editing.banner_image_url ?? "",
      banner_blur_hash: editing.banner_blur_hash ?? "",
      product_ids: (editing.products ?? []).map((row) => row.product_id),
    });
  }, [editing]);

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
      starts_at: form.starts_at,
      ends_at: form.ends_at,
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
      dateStyle: "short",
      timeStyle: "short",
    });

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell title={t("admin.campaigns.title")} subtitle={t("admin.campaigns.subtitle")}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-end bg-[#f4f4f5] pb-3">
          <Button
            type="button"
            size="sm"
            className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
            onClick={openCreate}
          >
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.campaigns.newCampaign")}
          </Button>
        </div>

        {isPending ? (
          <p className="text-sm text-[#71717a]">{t("admin.campaigns.loading")}</p>
        ) : campaigns?.length ? (
          <ul className="space-y-3">
            {campaigns.map((campaign) => {
              const status = campaignStatus(campaign);
              return (
                <li
                  key={campaign.id}
                  className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-[#e4e4e7] bg-white p-4"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    {campaign.banner_image_url ? (
                      <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-[#e4e4e7] bg-[#f4f4f5]">
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
                        <h2 className="font-semibold text-[#18181b]">{campaign.name}</h2>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            status === "live" && "bg-emerald-100 text-emerald-800",
                            status === "scheduled" && "bg-amber-100 text-amber-800",
                            status === "ended" && "bg-[#f4f4f5] text-[#71717a]",
                            status === "inactive" && "bg-red-50 text-red-700",
                          )}
                        >
                          {t(`admin.campaigns.status.${status}`)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-[#71717a]">
                        {campaign.type === "percent"
                          ? t("admin.campaigns.percentOff", { value: campaign.discount_value })
                          : t("admin.campaigns.fixedOff", { value: campaign.discount_value })}
                        {" · "}
                        {t("admin.campaigns.productCount", {
                          count: campaign.products?.length ?? 0,
                        })}
                      </p>
                      <p className="mt-1 text-xs text-[#71717a]">
                        {dateLabel(campaign.starts_at)} — {dateLabel(campaign.ends_at)}
                      </p>
                    </div>
                  </div>
                  <RowIconActions
                    editLabel={t("admin.campaigns.edit")}
                    deleteLabel={t("admin.campaigns.delete")}
                    onEdit={() => {
                      setEditing(campaign);
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
          <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-4 py-10 text-center text-sm text-[#71717a]">
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
                className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
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
              <p className="text-xs font-medium text-[#71717a]">{t("admin.campaigns.bannerLabel")}</p>
              <p className="text-xs text-[#71717a]">{t("admin.campaigns.bannerHint")}</p>
              {form.banner_image_url ? (
                <div className="overflow-hidden rounded-xl border border-[#e4e4e7]">
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
                  <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                    <AppIcon icon={Upload} size="sm" />
                    {t("admin.campaigns.uploadImage")}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
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
              <label className="block text-xs text-[#71717a]">
                {t("admin.campaigns.typeLabel")}
                <select
                  className={`${inputClass} mt-1`}
                  value={form.type}
                  onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as CampaignType }))}
                >
                  <option value="percent">{t("admin.campaigns.typePercent")}</option>
                  <option value="fixed">{t("admin.campaigns.typeFixed")}</option>
                </select>
              </label>
              <label className="block text-xs text-[#71717a]">
                {t("admin.campaigns.valueLabel")}
                <input
                  className={`${inputClass} mt-1`}
                  type="number"
                  min={0.001}
                  step={form.type === "percent" ? 1 : 0.001}
                  max={form.type === "percent" ? 90 : undefined}
                  value={form.discount_value}
                  onChange={(e) => setForm((s) => ({ ...s, discount_value: Number(e.target.value) }))}
                  required
                />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs text-[#71717a]">
                {t("admin.campaigns.startsAt")}
                <input
                  className={`${inputClass} mt-1`}
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm((s) => ({ ...s, starts_at: e.target.value }))}
                  required
                />
              </label>
              <label className="block text-xs text-[#71717a]">
                {t("admin.campaigns.endsAt")}
                <input
                  className={`${inputClass} mt-1`}
                  type="datetime-local"
                  value={form.ends_at}
                  onChange={(e) => setForm((s) => ({ ...s, ends_at: e.target.value }))}
                  required
                />
              </label>
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
              <p className="mb-1 text-xs font-medium text-[#71717a]">{t("admin.campaigns.productsLabel")}</p>
              <input
                className={`${inputClass} mb-2`}
                placeholder={t("admin.campaigns.productSearch")}
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <div className="max-h-56 space-y-1 overflow-y-auto rounded-xl border border-[#e4e4e7] p-2">
                {filteredProducts.map((product) => {
                  const checked = form.product_ids.includes(product.id);
                  return (
                    <label key={product.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-[#f7faf7]">
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
                  <p className="px-2 py-3 text-xs text-[#71717a]">{t("admin.campaigns.noProducts")}</p>
                )}
              </div>
              <p className="mt-1 text-[11px] text-[#71717a]">
                {t("admin.campaigns.selectedCount", { count: form.product_ids.length })}
              </p>
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
