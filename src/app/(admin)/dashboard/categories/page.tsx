"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Upload } from "lucide-react";
import {
  createCategoryAction,
  deleteCategoryAction,
  getAdminCategoriesAction,
  updateCategoryAction,
} from "@/app/_actions/category-actions";
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
import { flattenCategoryTree, categoryDepth, validCategoryParents } from "@/lib/categories/tree";
import type { Category } from "@/app/_types/database.types";

type FormValues = {
  name: string;
  slug: string;
  sort_order: number;
  parent_id?: string;
  image_url?: string;
  blur_hash?: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  name: "",
  slug: "",
  sort_order: 0,
  parent_id: "",
  image_url: "",
  blur_hash: "",
};

const SKELETON_KEYS = ["s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8"] as const;

export default function AdminCategoriesPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const [editing, setEditing] = useState<Category | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const schema = z.object({
    name: z.string().min(1, t("admin.categories.validationName")),
    slug: z.string().min(1, t("admin.categories.validationSlug")),
    sort_order: z.number().int().min(0),
    parent_id: z.string().optional(),
    image_url: z.string().optional(),
    blur_hash: z.string().optional(),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
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
    if (!editing) return;
    form.reset({
      name: editing.name,
      slug: editing.slug,
      sort_order: editing.sort_order,
      parent_id: editing.parent_id ?? "",
      image_url: editing.image_url ?? "",
      blur_hash: editing.blur_hash ?? "",
    });
  }, [editing, form]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
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

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setFormOpen(true);
  };

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      parent_id: values.parent_id?.trim() || null,
      image_url: values.image_url?.trim() || null,
      blur_hash: values.image_url?.trim() ? values.blur_hash?.trim() || null : null,
    };

    if (editing) {
      runAction(() => updateCategoryAction(editing.id, payload), {
        successMessage: t("notifications.categoryUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createCategoryAction(payload), {
        successMessage: t("notifications.categoryCreated"),
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
      title={t("admin.categories.title")}
      subtitle={t("admin.categories.subtitle")}
    >
      <div className="space-y-4">
        <div className="sticky top-0 z-10 flex items-center justify-end bg-[#f4f4f5] pb-3">
          <Button
            type="button"
            size="sm"
            onClick={openCreate}
          >
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.categories.newCategory")}
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
        ) : categories?.length ? (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {flattenCategoryTree(categories).map((cat) => (
              <li key={cat.id} style={{ paddingInlineStart: `${Math.min(categoryDepth(categories, cat), 4) * 8}px` }}>
                <article
                  className={cn(
                    "group flex h-full flex-col overflow-hidden rounded-2xl border bg-white transition-all",
                    editing?.id === cat.id
                      ? "border-[#0d9488] shadow-[0_8px_24px_rgba(107,143,113,0.18)]"
                      : "border-[#e4e4e7] hover:-translate-y-0.5 hover:border-[#0d9488]/50 hover:shadow-[0_8px_20px_rgba(24,24,27,0.08)]",
                  )}
                >
                  <button
                    type="button"
                    className="flex flex-1 flex-col text-start"
                    onClick={() => openEdit(cat)}
                    aria-label={t("admin.categories.edit")}
                  >
                    <span className="relative flex aspect-square items-center justify-center bg-[#fafafa] p-3">
                      {cat.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cat.image_url}
                          alt=""
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0d9488]/12 text-sm font-semibold text-[#0f766e]">
                          {cat.name.slice(0, 2)}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-1 flex-col gap-0.5 px-3 pt-2.5 pb-1">
                      <span className="line-clamp-2 text-sm font-semibold leading-snug text-[#18181b]">
                        {cat.name}
                      </span>
                      {cat.parent_id ? (
                        <span className="text-[10px] text-[#0d9488]">
                          {t("admin.categories.childBadge")}
                          {categories.find((item) => item.id === cat.parent_id)
                            ? ` · ${categories.find((item) => item.id === cat.parent_id)?.name}`
                            : ""}
                        </span>
                      ) : null}
                      <span className="truncate text-[11px] text-[#71717a]" dir="ltr">
                        {cat.slug}
                      </span>
                    </span>
                  </button>
                  <div className="mt-auto flex items-center justify-between border-t border-[#f4f4f5] px-2 py-1">
                    <span className="rounded-md bg-[#f4f4f5] px-1.5 py-0.5 text-[10px] text-[#71717a]">
                      {t("admin.categories.sortOrderLabel")} {cat.sort_order}
                    </span>
                    <RowIconActions
                      editLabel={t("admin.categories.edit")}
                      deleteLabel={t("admin.categories.delete")}
                      onEdit={() => openEdit(cat)}
                      onDelete={() =>
                        runAction(() => deleteCategoryAction(cat.id), {
                          successMessage: t("notifications.categoryDeleted"),
                          onSuccess: () => {
                            if (editing?.id === cat.id) closeForm();
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
            {t("admin.categories.empty")}
          </p>
        )}

        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.categories.editCategory") : t("admin.categories.newCategory")}
          size="md"
          busy={isActionPending || isUploadPending}
          busyLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending || isUploadPending}>
                {t("admin.categories.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-category-form"
                loading={isActionPending || isUploadPending}
                loadingLabel={isUploadPending ? t("common.uploading") : t("common.saving")}
              >
                {editing ? t("admin.categories.save") : t("admin.categories.create")}
              </Button>
            </>
          }
        >
          <form id="admin-category-form" onSubmit={onSubmit} className="space-y-3">
            {imageUrl ? (
              <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-[#fafafa]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="" className="mx-auto aspect-square max-h-48 object-contain p-4" />
              </div>
            ) : null}

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
                {t("admin.categories.parentLabel")}
              </label>
              <p className="mb-1 text-[11px] text-[#71717a]">{t("admin.categories.nestedHint")}</p>
              <select {...form.register("parent_id")} className={inputClass}>
                <option value="">{t("admin.categories.noParent")}</option>
                {validCategoryParents(categories ?? [], editing?.id).map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {`${"— ".repeat(categoryDepth(categories ?? [], cat))}${cat.name}`}
                    </option>
                  ))}
              </select>
            </div>
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
              {imageUrl ? (
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
              ) : null}
            </div>
          </form>
        </Modal>
      </div>
    </AdminShell>
  );
}
