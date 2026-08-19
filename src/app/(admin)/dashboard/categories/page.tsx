"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  getAdminCategoriesAction,
  updateCategoryAction,
} from "@/app/_actions/category-actions";
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
import type { Category } from "@/app/_types/database.types";

type FormValues = {
  name: string;
  slug: string;
  sort_order: number;
  image_url?: string;
  blur_hash?: string;
};

export default function AdminCategoriesPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<Category | null>(null);

  const schema = z.object({
    name: z.string().min(1, t("admin.categories.validationName")),
    slug: z.string().min(1, t("admin.categories.validationSlug")),
    sort_order: z.number().int().min(0),
    image_url: z.string().optional(),
    blur_hash: z.string().optional(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", sort_order: 0, image_url: "", blur_hash: "" },
  });

  const imageUrl = form.watch("image_url");

  const { data: categories, isPending } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const result = await getAdminCategoriesAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        sort_order: editing.sort_order,
        image_url: editing.image_url ?? "",
        blur_hash: editing.blur_hash ?? "",
      });
    }
  }, [editing, form]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const resetForm = () => {
    form.reset({ name: "", slug: "", sort_order: 0, image_url: "", blur_hash: "" });
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      image_url: values.image_url?.trim() || null,
      blur_hash: values.image_url?.trim() ? values.blur_hash?.trim() || null : null,
    };

    if (editing) {
      runAction(() => updateCategoryAction(editing.id, payload), {
        successMessage: t("notifications.categoryUpdated"),
        onSuccess: () => {
          setEditing(null);
          resetForm();
          refetch();
        },
      });
    } else {
      runAction(() => createCategoryAction(payload), {
        successMessage: t("notifications.categoryCreated"),
        onSuccess: () => {
          resetForm();
          refetch();
        },
      });
    }
  });

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell
      title={t("admin.categories.title")}
      subtitle={t("admin.categories.subtitle")}
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm lg:col-span-2"
        >
          <h2 className="font-semibold">
            {editing ? t("admin.categories.editCategory") : t("admin.categories.newCategory")}
          </h2>

          {imageUrl && (
            <div className="overflow-hidden rounded-xl border border-[#e4e4e7]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="aspect-square w-full object-cover" />
            </div>
          )}

          <input type="hidden" {...form.register("blur_hash")} />

          <input
            {...form.register("name")}
            placeholder={t("admin.categories.namePlaceholder")}
            className={inputClass}
          />
          <input
            {...form.register("slug")}
            placeholder={t("admin.categories.slugPlaceholder")}
            className={inputClass}
            dir="ltr"
          />
          <div>
            <label className="mb-1 block text-xs text-[#71717a]">
              {t("admin.categories.sortOrderLabel")}
            </label>
            <input
              {...form.register("sort_order", { valueAsNumber: true })}
              type="number"
              min={0}
              className={inputClass}
            />
          </div>

          <input
            {...form.register("image_url")}
            placeholder={t("admin.categories.imageUrlPlaceholder")}
            className={inputClass}
            dir="ltr"
          />

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isActionPending || isUploadPending}>
              {editing ? t("admin.categories.save") : t("admin.categories.create")}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  resetForm();
                }}
              >
                {t("admin.categories.cancel")}
              </Button>
            )}
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                <AppIcon icon={Upload} size="sm" />
                {t("admin.categories.uploadImage")}
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
                  uploadImage(file, "categories", {
                    successMessage: t("notifications.imageUploaded"),
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                      if (data?.blurHash) form.setValue("blur_hash", data.blurHash);
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
                  form.setValue("image_url", "");
                  form.setValue("blur_hash", "");
                }}
              >
                {t("admin.categories.removeImage")}
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-3">
          {isPending && (
            <p className="text-sm text-[#71717a]">{t("admin.categories.loading")}</p>
          )}
          <ul className="space-y-2">
            {categories?.map((cat) => (
              <li
                key={cat.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4e4e7] bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {cat.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cat.image_url}
                      alt=""
                      className="h-12 w-12 rounded-xl border border-[#e4e4e7] object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f4f4f5] text-xs text-[#71717a]">
                      {cat.name.slice(0, 2)}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-xs text-[#71717a]" dir="ltr">
                      {cat.slug} · {t("admin.categories.sortOrderLabel")}: {cat.sort_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="text-sm text-[#527559]"
                    onClick={() => setEditing(cat)}
                  >
                    {t("admin.categories.edit")}
                  </button>
                  <button
                    type="button"
                    className="text-sm text-red-600"
                    onClick={() =>
                      runAction(() => deleteCategoryAction(cat.id), {
                        successMessage: t("notifications.categoryDeleted"),
                        onSuccess: () => {
                          if (editing?.id === cat.id) setEditing(null);
                          refetch();
                        },
                      })
                    }
                  >
                    {t("admin.categories.delete")}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          {!isPending && !categories?.length && (
            <p className="text-sm text-[#71717a]">{t("admin.categories.empty")}</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
