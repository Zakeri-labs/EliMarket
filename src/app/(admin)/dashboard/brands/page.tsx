"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload } from "lucide-react";
import {
  createBrandAction,
  deleteBrandAction,
  getAdminBrandsAction,
  updateBrandAction,
} from "@/app/_actions/brand-actions";
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
import type { Brand } from "@/app/_types/database.types";

type FormValues = {
  name: string;
  slug: string;
  sort_order: number;
  logo_url?: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  name: "",
  slug: "",
  sort_order: 0,
  logo_url: "",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"] as const;

export default function AdminBrandsPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<Brand | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("admin.brands.validationName")),
    slug: z.string().min(1, t("admin.brands.validationSlug")),
    sort_order: z.number().int().min(0),
    logo_url: z.string().optional(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const logoUrl = form.watch("logo_url");

  const { data: brands, isPending } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const result = await getAdminBrandsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    void queryClient.invalidateQueries({ queryKey: ["brands"] });
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    form.reset(DEFAULT_FORM_VALUES);
  };

  const openCreate = () => {
    setEditing(null);
    form.reset(DEFAULT_FORM_VALUES);
    setFormOpen(true);
  };

  const openEdit = (brand: Brand) => {
    setEditing(brand);
    form.reset({
      name: brand.name,
      slug: brand.slug,
      sort_order: brand.sort_order,
      logo_url: brand.logo_url ?? "",
    });
    setFormOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      logo_url: values.logo_url?.trim() || null,
    };

    if (editing) {
      runAction(() => updateBrandAction(editing.id, payload), {
        successMessage: t("notifications.brandUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createBrandAction(payload), {
        successMessage: t("notifications.brandCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  });

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell
      title={t("admin.brands.title")}
      subtitle={t("admin.brands.subtitle")}
    >
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-end bg-[#f4f4f5] pb-3">
          <Button type="button" size="sm" onClick={openCreate}>
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.brands.newBrand")}
          </Button>
        </div>

        {isPending ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {SKELETON_KEYS.map((key) => (
              <li
                key={key}
                className="animate-pulse overflow-hidden rounded-2xl border border-[#e4e4e7] bg-white"
              >
                <div className="aspect-square bg-[#f4f4f5]" />
                <div className="space-y-2 p-3">
                  <div className="h-3.5 w-3/4 rounded bg-[#f4f4f5]" />
                  <div className="h-2.5 w-1/2 rounded bg-[#f4f4f5]" />
                </div>
              </li>
            ))}
          </ul>
        ) : brands?.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {brands.map((brand) => (
              <li key={brand.id}>
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all",
                    editing?.id === brand.id
                      ? "border-[#6b8f71] shadow-[0_8px_24px_rgba(107,143,113,0.18)]"
                      : "border-[#e4e4e7] hover:-translate-y-0.5 hover:border-[#6b8f71]/50 hover:shadow-[0_8px_20px_rgba(24,24,27,0.08)]",
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 flex-col text-start"
                    onClick={() => openEdit(brand)}
                    aria-label={t("admin.brands.edit")}
                  >
                    <span className="relative flex aspect-square items-center justify-center bg-[#fafafa] p-3">
                      {brand.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.logo_url}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#6b8f71]/12 text-sm font-semibold text-[#527559]">
                          {brand.name.slice(0, 2)}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5 px-3 pt-2.5 pb-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-[#18181b]">
                        {brand.name}
                      </span>
                      <span className="truncate text-[11px] text-[#71717a]" dir="ltr">
                        {brand.slug}
                      </span>
                    </span>
                  </button>
                  <div className="mt-auto flex items-center justify-between border-t border-[#f4f4f5] px-2 py-1">
                    <span className="rounded-md bg-[#f4f4f5] px-1.5 py-0.5 text-[10px] text-[#71717a]">
                      {t("admin.brands.sortOrderLabel")} {brand.sort_order}
                    </span>
                    <RowIconActions
                      editLabel={t("admin.brands.edit")}
                      deleteLabel={t("admin.brands.delete")}
                      onEdit={() => openEdit(brand)}
                      onDelete={() =>
                        runAction(() => deleteBrandAction(brand.id), {
                          successMessage: t("notifications.brandDeleted"),
                          onSuccess: () => {
                            if (editing?.id === brand.id) closeForm();
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
            {t("admin.brands.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.brands.editBrand") : t("admin.brands.newBrand")}
          size="md"
          busy={isActionPending || isUploadPending}
          busyLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending || isUploadPending}>
                {t("admin.brands.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-brand-form"
                loading={isActionPending || isUploadPending}
                loadingLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
              >
                {editing ? t("admin.brands.save") : t("admin.brands.create")}
              </Button>
            </>
          }
        >
          <form id="admin-brand-form" onSubmit={onSubmit} className="space-y-3">
            {logoUrl ? (
              <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-[#fafafa]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoUrl} alt="" className="mx-auto aspect-square max-h-48 object-contain p-4" />
              </div>
            ) : null}

            <input
              {...form.register("name")}
              placeholder={t("admin.brands.namePlaceholder")}
              className={inputClass}
            />
            <input
              {...form.register("slug")}
              placeholder={t("admin.brands.slugPlaceholder")}
              className={inputClass}
              dir="ltr"
            />
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.brands.sortOrderLabel")}
              </label>
              <input
                {...form.register("sort_order", { valueAsNumber: true })}
                type="number"
                min={0}
                className={inputClass}
              />
            </div>

            <input
              {...form.register("logo_url")}
              placeholder={t("admin.brands.logoUrlPlaceholder")}
              className={inputClass}
              dir="ltr"
            />

            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                  <AppIcon icon={Upload} size="sm" />
                  {t("admin.brands.uploadLogo")}
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
                    uploadImage(file, "brands", {
                      successMessage: t("notifications.imageUploaded"),
                      onSuccess: (data) => {
                        if (data?.url) form.setValue("logo_url", data.url);
                      },
                    });
                    e.target.value = "";
                  }}
                />
              </label>
              {logoUrl ? (
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => form.setValue("logo_url", "")}
                >
                  {t("admin.brands.removeLogo")}
                </Button>
              ) : null}
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
