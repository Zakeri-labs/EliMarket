"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import {
  getStoreSettingsAction,
  updateHeroSettingsAction,
} from "@/app/_actions/settings-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useFormAction } from "@/app/hooks/use-form-action";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  useAdminImageUpload,
} from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { useTranslations } from "@/i18n/use-translations";

export default function AdminBannersPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();

  const { data: settings, isPending } = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const result = await getStoreSettingsAction();
      return result.data;
    },
  });

  const [badge, setBadge] = useState("");
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaHref, setCtaHref] = useState("/categories");
  const [imageUrl, setImageUrl] = useState("");
  const [heroBlurHash, setHeroBlurHash] = useState("");

  useEffect(() => {
    if (!settings) return;
    setBadge(settings.hero_badge ?? "");
    setTitle(settings.hero_title ?? "");
    setSubtitle(settings.hero_subtitle ?? "");
    setCtaLabel(settings.hero_cta_label ?? "");
    setCtaHref(settings.hero_cta_href ?? "/categories");
    setImageUrl(settings.hero_image_url ?? "");
    setHeroBlurHash(settings.hero_blur_hash ?? "");
  }, [settings]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["store-settings"] });
  };

  const save = () => {
    runAction(
      () =>
        updateHeroSettingsAction({
          hero_badge: badge,
          hero_title: title,
          hero_subtitle: subtitle,
          hero_cta_label: ctaLabel,
          hero_cta_href: ctaHref,
          hero_image_url: imageUrl,
          hero_blur_hash: imageUrl ? heroBlurHash || null : null,
        }),
      {
        successMessage: t("notifications.heroUpdated"),
        onSuccess: () => refetch(),
      },
    );
  };

  const inputClass =
    "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell title={t("admin.banners.title")} subtitle={t("admin.banners.subtitle")}>
      <div className="grid gap-8 lg:grid-cols-2">
        <form
          className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <h2 className="font-semibold">{t("admin.banners.formTitle")}</h2>
          <p className="text-xs text-[#71717a]">{t("admin.banners.formHint")}</p>

          {imageUrl && (
            <div className="overflow-hidden rounded-xl border border-[#e4e4e7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="aspect-[2/1] w-full object-cover" />
            </div>
          )}

          <input
            className={inputClass}
            placeholder={t("admin.banners.badgePlaceholder")}
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder={t("admin.banners.titlePlaceholder")}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className={inputClass}
            rows={2}
            placeholder={t("admin.banners.subtitlePlaceholder")}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder={t("admin.banners.ctaLabelPlaceholder")}
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
          <input
            className={inputClass}
            placeholder={t("admin.banners.ctaHrefPlaceholder")}
            value={ctaHref}
            onChange={(e) => setCtaHref(e.target.value)}
            dir="ltr"
          />
          <input
            className={inputClass}
            placeholder={t("admin.banners.imageUrlPlaceholder")}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            dir="ltr"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isActionPending || isUploadPending || isPending}>
              {t("admin.banners.save")}
            </Button>
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
                      if (data?.url) setImageUrl(data.url);
                      if (data?.blurHash) setHeroBlurHash(data.blurHash);
                    },
                  });
                  e.target.value = "";
                }}
              />
            </label>
            {imageUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setImageUrl("");
                  setHeroBlurHash("");
                }}
              >
                {t("admin.banners.removeImage")}
              </Button>
            )}
          </div>
        </form>

        <div className="rounded-2xl border border-[#e4e4e7] bg-[#fafafa] p-5">
          <h2 className="mb-3 font-semibold">{t("admin.banners.previewTitle")}</h2>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-[#0d9488] to-[#2dd4bf] p-5 text-black">
            {imageUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt=""
                  width={600}
                  height={160}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-black/45" />
              </>
            )}
            <div className={imageUrl ? "relative z-10 text-white" : ""}>
              <p className="text-xs font-medium opacity-80">
                {badge || t("home.heroBadge")}
              </p>
              <h3 className="mt-1 text-lg font-bold">
                {title || t("home.heroTitle")}
              </h3>
              <p className="mt-1 text-xs opacity-80">
                {subtitle || t("home.heroSubtitle")}
              </p>
              <span className="mt-3 inline-block rounded-xl bg-black/20 px-4 py-2 text-xs font-semibold">
                {ctaLabel || t("home.heroCta")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
