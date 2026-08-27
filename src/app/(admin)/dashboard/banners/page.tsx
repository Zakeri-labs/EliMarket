"use client";

import { useState } from "react";
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
import { Spinner } from "@/components/ui/Spinner";
import { AppIcon } from "@/components/icons/AppIcon";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  useAdminImageUpload,
} from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { cn } from "@/app/utils/cn";
import { LOCALES, LOCALE_LABELS, type Locale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";
import type { HeroBanner } from "@/app/_types/database.types";

type LangText = Record<Locale, string>;

type FormState = {
  badge: LangText;
  title: LangText;
  subtitle: LangText;
  cta_label: LangText;
  cta_href: string;
  image_url: string;
  blur_hash: string;
  image_url_ltr: string;
  blur_hash_ltr: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY_LANG_TEXT: LangText = { fa: "", ar: "", en: "" };

const EMPTY_FORM: FormState = {
  badge: EMPTY_LANG_TEXT,
  title: EMPTY_LANG_TEXT,
  subtitle: EMPTY_LANG_TEXT,
  cta_label: EMPTY_LANG_TEXT,
  cta_href: "/categories",
  image_url: "",
  blur_hash: "",
  image_url_ltr: "",
  blur_hash_ltr: "",
  sort_order: 0,
  is_active: true,
};

const langText = (
  fa: string | null,
  ar: string | null,
  en: string | null,
  legacy: string | null,
): LangText => ({
  fa: fa ?? legacy ?? "",
  ar: ar ?? "",
  en: en ?? "",
});

const SKELETON_KEYS = ["s1", "s2", "s3"] as const;

function BannerImageField({
  label,
  hint,
  value,
  placeholder,
  inputClass,
  uploading,
  uploadImage,
  onUrlChange,
  onUploaded,
  onRemove,
}: {
  label: string;
  hint?: string;
  value: string;
  placeholder: string;
  inputClass: string;
  uploading: boolean;
  uploadImage: ReturnType<typeof useAdminImageUpload>["uploadImage"];
  onUrlChange: (url: string) => void;
  onUploaded: (url: string, blurHash: string) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslations();

  return (
    <div className="space-y-2 rounded-xl border border-[#e4e4e7] p-3">
      <p className="text-xs font-medium text-[#3f3f46]">{label}</p>
      {hint ? <p className="text-[11px] text-[#71717a]">{hint}</p> : null}

      {value ? (
        <div className="overflow-hidden rounded-lg border border-[#e4e4e7]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="aspect-[16/7] w-full object-cover" />
        </div>
      ) : null}

      <input
        className={inputClass}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onUrlChange(e.target.value)}
        dir="ltr"
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className={cn("cursor-pointer", uploading && "pointer-events-none opacity-60")}>
          <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
            {uploading ? (
              <Spinner size="sm" className="text-[#0d9488]" />
            ) : (
              <AppIcon icon={Upload} size="sm" />
            )}
            {uploading ? t("common.uploading") : t("admin.banners.uploadImage")}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={uploading}
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
                  onUploaded(data.url || value, data.blurHash || "");
                },
              });
              e.target.value = "";
            }}
          />
        </label>
        {value ? (
          <Button type="button" variant="secondary" onClick={onRemove} disabled={uploading}>
            {t("admin.banners.removeImage")}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export default function AdminBannersPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<HeroBanner | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [langTab, setLangTab] = useState<Locale>("fa");

  const { data: banners, isPending } = useQuery({
    queryKey: ["admin-hero-banners"],
    queryFn: async () => {
      const result = await getAdminHeroBannersAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

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
    setLangTab("fa");
    setForm({
      ...EMPTY_FORM,
      sort_order: banners?.length ?? 0,
    });
    setFormOpen(true);
  };

  const openEdit = (banner: HeroBanner) => {
    setEditing(banner);
    setLangTab("fa");
    setForm({
      badge: langText(banner.badge_fa, banner.badge_ar, banner.badge_en, banner.badge),
      title: langText(banner.title_fa, banner.title_ar, banner.title_en, banner.title),
      subtitle: langText(
        banner.subtitle_fa,
        banner.subtitle_ar,
        banner.subtitle_en,
        banner.subtitle,
      ),
      cta_label: langText(
        banner.cta_label_fa,
        banner.cta_label_ar,
        banner.cta_label_en,
        banner.cta_label,
      ),
      cta_href: banner.cta_href ?? "/categories",
      image_url: banner.image_url ?? "",
      blur_hash: banner.blur_hash ?? "",
      image_url_ltr: banner.image_url_ltr ?? "",
      blur_hash_ltr: banner.blur_hash_ltr ?? "",
      sort_order: banner.sort_order,
      is_active: banner.is_active,
    });
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
      image_url_ltr: form.image_url_ltr,
      blur_hash_ltr: form.blur_hash_ltr,
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
              >
                {editing ? t("admin.banners.save") : t("admin.banners.create")}
              </Button>
            </>
          }
        >
          <form
            id="admin-banner-form"
            className={cn(
              "space-y-3 transition-opacity",
              (isActionPending || isUploadPending) &&
                "pointer-events-none opacity-50",
            )}
            aria-busy={isActionPending || isUploadPending}
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <p className="text-xs text-[#71717a]">{t("admin.banners.formHint")}</p>

            <BannerImageField
              label={t("admin.banners.imageRtlLabel")}
              value={form.image_url}
              placeholder={t("admin.banners.imageUrlPlaceholder")}
              inputClass={inputClass}
              uploading={isUploadPending}
              uploadImage={uploadImage}
              onUrlChange={(url) => setForm((s) => ({ ...s, image_url: url }))}
              onUploaded={(url, hash) =>
                setForm((s) => ({
                  ...s,
                  image_url: url,
                  blur_hash: hash || s.blur_hash,
                }))
              }
              onRemove={() =>
                setForm((s) => ({ ...s, image_url: "", blur_hash: "" }))
              }
            />

            <BannerImageField
              label={t("admin.banners.imageLtrLabel")}
              hint={t("admin.banners.imageLtrHint")}
              value={form.image_url_ltr}
              placeholder={t("admin.banners.imageUrlPlaceholder")}
              inputClass={inputClass}
              uploading={isUploadPending}
              uploadImage={uploadImage}
              onUrlChange={(url) => setForm((s) => ({ ...s, image_url_ltr: url }))}
              onUploaded={(url, hash) =>
                setForm((s) => ({
                  ...s,
                  image_url_ltr: url,
                  blur_hash_ltr: hash || s.blur_hash_ltr,
                }))
              }
              onRemove={() =>
                setForm((s) => ({ ...s, image_url_ltr: "", blur_hash_ltr: "" }))
              }
            />

            <div className="space-y-2 rounded-xl border border-[#e4e4e7] p-3">
              <p className="text-xs font-medium text-[#3f3f46]">
                {t("admin.banners.textSection")}
              </p>
              <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1">
                {LOCALES.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    className={cn(
                      "flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors",
                      langTab === loc
                        ? "bg-white text-[#18181b] shadow-sm"
                        : "text-[#71717a] hover:text-[#18181b]",
                    )}
                    onClick={() => setLangTab(loc)}
                  >
                    {LOCALE_LABELS[loc]}
                  </button>
                ))}
              </div>

              <input
                key={`badge-${langTab}`}
                className={inputClass}
                placeholder={t("admin.banners.badgePlaceholder")}
                value={form.badge[langTab]}
                dir={langTab === "en" ? "ltr" : "rtl"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    badge: { ...s.badge, [langTab]: e.target.value },
                  }))
                }
              />
              <input
                key={`title-${langTab}`}
                className={inputClass}
                placeholder={t("admin.banners.titlePlaceholder")}
                value={form.title[langTab]}
                dir={langTab === "en" ? "ltr" : "rtl"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    title: { ...s.title, [langTab]: e.target.value },
                  }))
                }
              />
              <textarea
                key={`subtitle-${langTab}`}
                className={inputClass}
                rows={2}
                placeholder={t("admin.banners.subtitlePlaceholder")}
                value={form.subtitle[langTab]}
                dir={langTab === "en" ? "ltr" : "rtl"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    subtitle: { ...s.subtitle, [langTab]: e.target.value },
                  }))
                }
              />
              <input
                key={`cta-${langTab}`}
                className={inputClass}
                placeholder={t("admin.banners.ctaLabelPlaceholder")}
                value={form.cta_label[langTab]}
                dir={langTab === "en" ? "ltr" : "rtl"}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    cta_label: { ...s.cta_label, [langTab]: e.target.value },
                  }))
                }
              />
              <p className="text-[11px] text-[#71717a]">
                {t("admin.banners.textLangHint")}
              </p>
            </div>

            <input
              className={inputClass}
              placeholder={t("admin.banners.ctaHrefPlaceholder")}
              value={form.cta_href}
              onChange={(e) => setForm((s) => ({ ...s, cta_href: e.target.value }))}
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
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
