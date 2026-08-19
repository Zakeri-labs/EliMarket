"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createCategoryAction,
  deleteCategoryAction,
  getAdminCategoriesAction,
  updateCategoryAction,
} from "@/app/_actions/category-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { useFormAction } from "@/app/hooks/use-form-action";
import { useTranslations } from "@/i18n/use-translations";
import type { Category } from "@/app/_types/database.types";

type FormValues = {
  name: string;
  slug: string;
  sort_order: number;
};

export default function AdminCategoriesPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const [editing, setEditing] = useState<Category | null>(null);

  const schema = z.object({
    name: z.string().min(1, t("admin.categories.validationName")),
    slug: z.string().min(1, t("admin.categories.validationSlug")),
    sort_order: z.number().int().min(0),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", sort_order: 0 },
  });

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
      });
    }
  }, [editing, form]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
    void queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const onSubmit = form.handleSubmit((values) => {
    if (editing) {
      runAction(() => updateCategoryAction(editing.id, values), {
        successMessage: t("notifications.categoryUpdated"),
        onSuccess: () => {
          setEditing(null);
          form.reset({ name: "", slug: "", sort_order: 0 });
          refetch();
        },
      });
    } else {
      runAction(() => createCategoryAction(values), {
        successMessage: t("notifications.categoryCreated"),
        onSuccess: () => {
          form.reset({ name: "", slug: "", sort_order: 0 });
          refetch();
        },
      });
    }
  });

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
          <input
            {...form.register("name")}
            placeholder={t("admin.categories.namePlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          />
          <input
            {...form.register("slug")}
            placeholder={t("admin.categories.slugPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
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
              className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isActionPending}>
              {editing ? t("admin.categories.save") : t("admin.categories.create")}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  form.reset({ name: "", slug: "", sort_order: 0 });
                }}
              >
                {t("admin.categories.cancel")}
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
                <div>
                  <p className="font-medium">{cat.name}</p>
                  <p className="text-xs text-[#71717a]" dir="ltr">
                    {cat.slug} · {t("admin.categories.sortOrderLabel")}: {cat.sort_order}
                  </p>
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
