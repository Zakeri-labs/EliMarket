"use client";

import { CompactItemCard } from "@/app/(admin)/_components/CompactItemCard";
import { KpiRow } from "@/app/(admin)/_components/KpiCards";
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
import { ListControls, ListError, useListControls } from "@/app/(admin)/_components/ListControls";
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

  const { data: brands, isPending, error: loadError } = useQuery({
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

  const inputClass = "w-full rounded-xl border border-input px-3 py-2.5";

  const list = useListControls(brands ?? []);

  return (
    <AdminShell
      actions={
        <>
          <Button type="button" size="sm" onClick={openCreate}>
            <AppIcon icon={Plus} size="xs" className="me-1.5" />
            {t("admin.brands.newBrand")}
          </Button>
        </>
      }
      title={t("admin.brands.title")}
      subtitle={t("admin.brands.subtitle")}
    >
      <KpiRow
        items={[
          { label: t("adminUi.total"), value: brands?.length, icon: "tag", tone: "teal" },
          { label: t("adminUi.withLogo"), value: brands?.filter((b) => b.logo_url).length, icon: "check", tone: "sky" },
          { label: t("adminUi.withoutLogo"), value: brands?.filter((b) => !b.logo_url).length, icon: "dashed", tone: "amber" },
        ]}
      />
      <div className="space-y-4">

        {loadError ? <ListError error={loadError} onRetry={() => void refetch()} /> : null}
        <ListControls list={list} entity={t("admin.nav.brands")} />
        {loadError && !brands ? null : isPending ? (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {SKELETON_KEYS.map((key) => (
              <li key={key} className="h-16 animate-pulse motion-reduce:animate-none rounded-[var(--card-radius)] bg-[var(--skeleton)]" />
            ))}
          </ul>
        ) : brands?.length ? (
          <ul className="grid grid-cols-1 gap-2 md:grid-cols-2 xl:grid-cols-3">
            {list.visible.map((brand) => (
              <li key={brand.id}>
                <CompactItemCard
                  image={brand.logo_url}
                  title={brand.name}
                  subtitle={<span dir="ltr">{brand.slug}</span>}
                  order={brand.sort_order}
                  orderLabel={t("admin.brands.sortOrderLabel")}
                  selected={editing?.id === brand.id}
                  openLabel={t("admin.brands.edit")}
                  onOpen={() => openEdit(brand)}
                  actions={
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
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className="admin-card px-4 py-10 text-center text-sm text-muted">
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
              <div className="overflow-hidden rounded-xl border border-border bg-background">
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
              <label className="mb-1 block text-xs text-muted">
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
                <span className="inline-flex items-center justify-center gap-2 rounded-md border border-border bg-white px-4 py-2 text-sm">
                  <AppIcon icon={Upload} size="sm" />
                  {t("admin.brands.uploadLogo")}
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
