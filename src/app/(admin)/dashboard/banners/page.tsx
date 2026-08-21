"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Upload } from "lucide-react";
import {
  createHeroBannerAction,
  deleteHeroBannerAction,
  getAdminHeroBannersAction,
  updateHeroBannerAction,
} from "@/app/_actions/banner-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
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
import type { HeroBanner } from "@/app/_types/database.types";

type FormState = {
  badge: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_href: string;
  image_url: string;
  blur_hash: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_FORM: FormState = {
  badge: "",
  title: "",
  subtitle: "",
  cta_label: "",
  cta_href: "/categories",
  image_url: "",
  blur_hash: "",
  sort_order: 0,
  is_active: true,
};

const SKELETON_KEYS = ["s1", "s2", "s3"] as const;

export default function AdminBannersPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  const { data: banners, isPending } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: async () => {
      const result = await getAdminHeroBannersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (!editing) return;
    setForm({
      badge: editing.badge ?? "",
      title: editing.title ?? "",
      subtitle: editing.subtitle ?? "",
      cta_label: editing.cta_label ?? "",
      cta_href: editing.cta_href ?? "/categories",
      image_url: editing.image_url ?? "",
      blur_hash: editing.blur_hash ?? "",
      sort_order: editing.sort_order,
      is_active: editing.is_active,
    });
  }, [editing]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-hero-banners"] });
    void queryClient.invalidateQueries({ queryKey: ["hero-banners"] });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(EMPTY_FORM);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...EMPTY_FORM,
      sort_order: banners?.length ?? 0,
    });
    setFormOpen(true);
  };

  const openEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setFormOpen(true);
  };

  const save = () => {
    const payload = {
      badge: form.badge,
      title: form.title,
      subtitle: form.subtitle,
      cta_label: form.cta_label,
      cta_href: form.cta_href,
      image_url: form.image_url,
      blur_hash: form.blur_hash,
      sort_order: form.sort_order,
      is_active: form.is_active,
    };

    if (editing) {
      runAction(() => updateHeroBannerAction(editing.id, payload), {
        successMessage: t("notifications.bannerUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createHeroBannerAction(payload), {
        successMessage: t("notifications.bannerCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  };

  const inputClass =
    "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell title={t("admin.banners.title")} subtitle={t("admin.banners.subtitle")}>
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-end bg-[#f4f4f5] pb-3">
          <Button
            type="button"
            size="sm"
            className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
            onClick={openCreate}
          >
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.banners.newBanner")}
          </Button>
        </div>

        {isPending ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <li
                key={key}
                className="h-48 animate-pulse rounded-2xl border border-[#e4e4e7] bg-white"
              />
            ))}
          </ul>
        ) : banners?.length ? (
          <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => (
              <li key={banner.id}>
                <article
                  className={cn(
                    "flex h-full flex-col overflow-hidden rounded-2xl border bg-white",
                    banner.is_active
                      ? "border-[#e4e4e7]"
                      : "border-dashed border-[#d4d4d8] opacity-80",
                  )}
                >
                  <button
                    type="button"
                    className="relative aspect-[16/7] overflow-hidden bg-[#f4f4f5] text-start"
                    onClick={() => openEdit(banner)}
                    aria-label={t("admin.banners.edit")}
                  >
                    {banner.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={banner.image_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="flex h-full items-center justify-center bg-gradient-to-l from-[#0d9488] to-[#2dd4bf] text-sm font-medium text-white">
                        {banner.title || t("admin.banners.formTitle")}
                      </span>
                    )}
                    {!banner.is_active && (
                      <span className="absolute end-2 top-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white">
                        {t("admin.banners.inactiveLabel")}
                      </span>
                    )}
                  </button>
                  <div className="flex items-start justify-between gap-2 p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">
                        {banner.title || t("admin.banners.titlePlaceholder")}
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-[#71717a]">
                        {t("admin.banners.sortOrderLabel")} {banner.sort_order}
                        {banner.cta_href ? ` · ${banner.cta_href}` : ""}
                      </p>
                    </div>
                    <RowIconActions
                      editLabel={t("admin.banners.edit")}
                      deleteLabel={t("admin.banners.delete")}
                      onEdit={() => openEdit(banner)}
                      onDelete={() =>
                        runAction(() => deleteHeroBannerAction(banner.id), {
                          successMessage: t("notifications.bannerDeleted"),
                          onSuccess: () => {
                            if (editing?.id === banner.id) closeForm();
                            refetch();
                          },
                        })
                      }
                    />
                  </div>
                </article>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl border border-dashed border-[#e4e4e7] bg-white px-4 py-10 text-center text-sm text-[#71717a]">
            {t("admin.banners.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.banners.editBanner") : t("admin.banners.newBanner")}
          size="lg"
          busy={isActionPending || isUploadPending}
          busyLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending || isUploadPending}>
                {t("admin.banners.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-banner-form"
                loading={isActionPending || isUploadPending}
                loadingLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
                className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
              >
                {editing ? t("admin.banners.save") : t("admin.banners.create")}
              </Button>
            </>
          }
        >
          <form
            id="admin-banner-form"
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <p className="text-xs text-[#71717a]">{t("admin.banners.formHint")}</p>

            {form.image_url ? (
              <div className="overflow-hidden rounded-xl border border-[#e4e4e7]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.image_url}
                  alt=""
                  className="aspect-[16/7] w-full object-cover"
                />
              </div>
            ) : null}

            <input
              className={inputClass}
              placeholder={t("admin.banners.badgePlaceholder")}
              value={form.badge}
              onChange={(e) => setForm((s) => ({ ...s, badge: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder={t("admin.banners.titlePlaceholder")}
              value={form.title}
              onChange={(e) => setForm((s) => ({ ...s, title: e.target.value }))}
            />
            <textarea
              className={inputClass}
              rows={2}
              placeholder={t("admin.banners.subtitlePlaceholder")}
              value={form.subtitle}
              onChange={(e) => setForm((s) => ({ ...s, subtitle: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder={t("admin.banners.ctaLabelPlaceholder")}
              value={form.cta_label}
              onChange={(e) => setForm((s) => ({ ...s, cta_label: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder={t("admin.banners.ctaHrefPlaceholder")}
              value={form.cta_href}
              onChange={(e) => setForm((s) => ({ ...s, cta_href: e.target.value }))}
              dir="ltr"
            />
            <input
              className={inputClass}
              placeholder={t("admin.banners.imageUrlPlaceholder")}
              value={form.image_url}
              onChange={(e) => setForm((s) => ({ ...s, image_url: e.target.value }))}
              dir="ltr"
            />
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.banners.sortOrderLabel")}
              </label>
              <input
                className={inputClass}
                type="number"
                min={0}
                value={form.sort_order}
                onChange={(e) =>
                  setForm((s) => ({ ...s, sort_order: Number(e.target.value) || 0 }))
                }
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((s) => ({ ...s, is_active: e.target.checked }))}
              />
              {t("admin.banners.activeLabel")}
            </label>

            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                  <AppIcon icon={Upload} size="sm" />
                  {t("admin.banners.uploadImage")}
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
                          image_url: data.url || s.image_url,
                          blur_hash: data.blurHash || s.blur_hash,
                        }));
                      },
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              {form.image_url ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setForm((s) => ({ ...s, image_url: "", blur_hash: "" }))}
                >
                  {t("admin.banners.removeImage")}
                </Button>
              ) : null}
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
