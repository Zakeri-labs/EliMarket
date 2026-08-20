"use client";

import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createBrandAction,
  deleteBrandAction,
  getAdminBrandsAction,
  updateBrandAction,
} from "@/app/_actions/brand-actions";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { useTranslations } from "@/i18n/use-translations";
import type { Brand } from "@/app/_types/database.types";

type FormValues = {
  name: string;
  slug: string;
  logo_url?: string;
  sort_order: number;
};

export default function AdminBrandsPage() {
  const { t } = useTranslations();
  const queryClient = useQueryClient();
  const { runAction, isPending: isActionPending } = useFormAction();
  const [editing, setEditing] = useState<Brand | null>(null);

  const schema = z.object({
    name: z.string().min(1, t("admin.brands.validationName")),
    slug: z.string().min(1, t("admin.brands.validationSlug")),
    logo_url: z.string().optional(),
    sort_order: z.number().int().min(0),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", logo_url: "", sort_order: 0 },
  });

  const { data: brands, isPending } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: async () => {
      const result = await getAdminBrandsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        logo_url: editing.logo_url ?? "",
        sort_order: editing.sort_order,
      });
    }
  }, [editing, form]);

  const refetch = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
    void queryClient.invalidateQueries({ queryKey: ["brands"] });
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
          setEditing(null);
          form.reset({ name: "", slug: "", logo_url: "", sort_order: 0 });
          refetch();
        },
      });
    } else {
      runAction(() => createBrandAction(payload), {
        successMessage: t("notifications.brandCreated"),
        onSuccess: () => {
          form.reset({ name: "", slug: "", logo_url: "", sort_order: 0 });
          refetch();
        },
      });
    }
  });

  return (
    <AdminShell
      title={t("admin.brands.title")}
      subtitle={t("admin.brands.subtitle")}
    >
      <div className="grid gap-8 lg:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm lg:col-span-2"
        >
          <h2 className="font-semibold">
            {editing ? t("admin.brands.editBrand") : t("admin.brands.newBrand")}
          </h2>
          <input
            {...form.register("name")}
            placeholder={t("admin.brands.namePlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          />
          <input
            {...form.register("slug")}
            placeholder={t("admin.brands.slugPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            dir="ltr"
          />
          <input
            {...form.register("logo_url")}
            placeholder={t("admin.brands.logoUrlPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
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
              className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isActionPending}>
              {editing ? t("admin.brands.save") : t("admin.brands.create")}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  form.reset({ name: "", slug: "", logo_url: "", sort_order: 0 });
                }}
              >
                {t("admin.brands.cancel")}
              </Button>
            )}
          </div>
        </form>

        <div className="lg:col-span-3">
          {isPending && (
            <p className="text-sm text-[#71717a]">{t("admin.brands.loading")}</p>
          )}
          <ul className="space-y-2">
            {brands?.map((brand) => (
              <li
                key={brand.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e4e4e7] bg-white p-4"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo_url}
                      alt=""
                      className="h-10 w-10 rounded-lg border border-[#e4e4e7] object-contain"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#f4f4f5] text-xs text-[#71717a]">
                      {brand.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-xs text-[#71717a]" dir="ltr">
                      {brand.slug} · {t("admin.brands.sortOrderLabel")}: {brand.sort_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <RowIconActions
                    editLabel={t("admin.brands.edit")}
                    deleteLabel={t("admin.brands.delete")}
                    onEdit={() => setEditing(brand)}
                    onDelete={() =>
                      runAction(() => deleteBrandAction(brand.id), {
                        successMessage: t("notifications.brandDeleted"),
                        onSuccess: () => {
                          if (editing?.id === brand.id) setEditing(null);
                          refetch();
                        },
                      })
                    }
                  />
                </div>
              </li>
            ))}
          </ul>
          {!isPending && !brands?.length && (
            <p className="text-sm text-[#71717a]">{t("admin.brands.empty")}</p>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
