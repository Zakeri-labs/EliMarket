"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Upload } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createProductAction,
  deleteProductAction,
  getCategoriesAction,
  updateProductAction,
  updateProductStockAction,
} from "@/app/_actions/product-actions";
import { getAdminBrandsAction } from "@/app/_actions/brand-actions";
import {
  editProductImageWithAiAction,
  generateProductDescriptionAction,
} from "@/app/_actions/ai-actions";
import { useAdminProducts } from "@/app/(admin)/dashboard/_hooks/use-admin-products";
import { useFormAction } from "@/app/hooks/use-form-action";
import {
  MAX_IMAGE_UPLOAD_BYTES,
  useAdminImageUpload,
} from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { DataTable } from "@/components/table";
import { formatPrice } from "@/config/brand";
import { mockAdminTableProducts } from "@/app/(admin)/dashboard/_mocks/product-table-mock";
import { useFormatPrice, useTranslations } from "@/i18n/use-translations";
import type { Brand, Category, Product } from "@/app/_types/database.types";

type FeatureDraft = { label: string; value: string };

const EMPTY_FEATURE: FeatureDraft = { label: "", value: "" };

type DescriptionLocale = "fa" | "ar" | "en";

const DESCRIPTION_TABS: { key: DescriptionLocale; labelKey: "descriptionFa" | "descriptionAr" | "descriptionEn"; dir: "rtl" | "ltr" }[] = [
  { key: "fa", labelKey: "descriptionFa", dir: "rtl" },
  { key: "ar", labelKey: "descriptionAr", dir: "rtl" },
  { key: "en", labelKey: "descriptionEn", dir: "ltr" },
];

type FormValues = {
  name: string;
  slug: string;
  description_fa?: string;
  description_ar?: string;
  description_en?: string;
  price: number;
  compare_at_price?: number;
  stock: number;
  category_id?: string;
  brand_id?: string;
  image_url?: string;
  blur_hash?: string;
  is_active: boolean;
};

export default function AdminProductsPage() {
  const { data: products, refetch, isPending: isProductsPending } = useAdminProducts();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { uploadImage, isPending: isUploadPending } = useAdminImageUpload();
  const { t } = useTranslations();
  const formatLocalizedPrice = useFormatPrice();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [descriptionTab, setDescriptionTab] = useState<DescriptionLocale>("fa");
  const [features, setFeatures] = useState<FeatureDraft[]>([{ ...EMPTY_FEATURE }]);

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("admin.products.validationName")),
        slug: z.string().min(1, t("admin.products.validationSlug")),
        description_fa: z.string().optional(),
        description_ar: z.string().optional(),
        description_en: z.string().optional(),
        price: z.number().min(0),
        compare_at_price: z.number().min(0).optional(),
        stock: z.number().int().min(0),
        category_id: z.string().optional(),
        brand_id: z.string().optional(),
        image_url: z.string().optional(),
        blur_hash: z.string().optional(),
        is_active: z.boolean(),
      }),
    [t],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description_fa: "",
      description_ar: "",
      description_en: "",
      price: 0,
      compare_at_price: undefined,
      stock: 0,
      category_id: "",
      brand_id: "",
      image_url: "",
      blur_hash: "",
      is_active: true,
    },
  });

  const imageUrl = form.watch("image_url");

  useEffect(() => {
    getCategoriesAction().then((r) => {
      if (r.success && r.data) setCategories(r.data);
    });
    getAdminBrandsAction().then((r) => {
      if (r.success && r.data) setBrands(r.data);
    });
  }, []);

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description_fa: editing.description_fa ?? editing.description ?? "",
        description_ar: editing.description_ar ?? "",
        description_en: editing.description_en ?? "",
        price: Number(editing.price),
        compare_at_price: editing.compare_at_price ? Number(editing.compare_at_price) : undefined,
        stock: editing.stock,
        category_id: editing.category_id ?? "",
        brand_id: editing.brand_id ?? "",
        image_url: editing.image_url ?? "",
        blur_hash: editing.blur_hash ?? "",
        is_active: editing.is_active,
      });
      setFeatures(
        editing.features?.length
          ? editing.features.map((feature) => ({
              label: feature.label,
              value: feature.value,
            }))
          : [{ ...EMPTY_FEATURE }],
      );
    }
  }, [editing, form]);

  useEffect(() => {
    if (products) {
      setStockDrafts(
        Object.fromEntries(products.map((p) => [p.id, String(p.stock)])),
      );
    }
  }, [products]);

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      category_id: values.category_id || null,
      brand_id: values.brand_id || null,
      description_fa: values.description_fa?.trim() || null,
      description_ar: values.description_ar?.trim() || null,
      description_en: values.description_en?.trim() || null,
      image_url: values.image_url || null,
      blur_hash: values.image_url ? values.blur_hash || null : null,
      compare_at_price: values.compare_at_price ? values.compare_at_price : null,
      features: features
        .map((feature) => ({
          label: feature.label.trim(),
          value: feature.value.trim(),
        }))
        .filter((feature) => feature.label && feature.value),
    };

    if (editing) {
      runAction(() => updateProductAction(editing.id, payload), {
        successMessage: t("notifications.productUpdated"),
        onSuccess: () => {
          setEditing(null);
          form.reset();
          setFeatures([{ ...EMPTY_FEATURE }]);
          refetch();
        },
      });
    } else {
      runAction(() => createProductAction(payload), {
        successMessage: t("notifications.productCreated"),
        onSuccess: () => {
          form.reset();
          setFeatures([{ ...EMPTY_FEATURE }]);
          refetch();
        },
      });
    }
  });

  const saveStock = (productId: string) => {
    const value = Number(stockDrafts[productId]);
    if (Number.isNaN(value) || value < 0) return;
    runAction(() => updateProductStockAction(productId, value), {
      successMessage: t("notifications.stockUpdated"),
      onSuccess: () => refetch(),
    });
  };

  const isSkeleton = isProductsPending;
  const tableData = isSkeleton ? mockAdminTableProducts() : (products ?? []);

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "image_url",
        header: t("admin.products.colImage"),
        enableSorting: false,
        cell: ({ row }) => (
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#f4f4f5]">
            {row.original.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={row.original.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ProductPlaceholder size="md" />
            )}
          </div>
        ),
      },
      {
        accessorKey: "name",
        header: t("admin.products.colName"),
        cell: ({ row }) => (
          <div>
            <p className="font-medium">{row.original.name}</p>
            <p className="text-xs text-[#71717a]" dir="ltr">
              {row.original.slug}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "price",
        header: t("admin.products.colPrice"),
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">
            {formatLocalizedPrice(Number(getValue()))}
          </span>
        ),
      },
      {
        accessorKey: "stock",
        header: t("admin.products.colStock"),
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <input
              type="number"
              min={0}
              className="w-16 rounded border border-[#e4e4e7] px-2 py-1 text-sm"
              value={stockDrafts[row.original.id] ?? row.original.stock}
              onChange={(e) =>
                setStockDrafts((s) => ({ ...s, [row.original.id]: e.target.value }))
              }
            />
            <button
              type="button"
              className="rounded bg-[#6b8f71]/15 px-2 py-1 text-[#527559]"
              onClick={() => saveStock(row.original.id)}
            >
              <AppIcon icon={Check} size="xs" />
            </button>
          </div>
        ),
      },
      {
        accessorKey: "is_active",
        header: t("admin.products.colStatus"),
        cell: ({ row }) => (
          <div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                row.original.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {row.original.is_active
                ? t("admin.products.active")
                : t("admin.products.inactive")}
            </span>
            {row.original.stock === 0 && (
              <span className="mt-1 block text-xs text-red-600">
                {t("admin.products.outOfStock")}
              </span>
            )}
          </div>
        ),
        filterFn: (row, _id, value) => {
          if (!value || value === "all") return true;
          return value === "active" ? row.original.is_active : !row.original.is_active;
        },
        meta: {
          filterComponent: ({ value, onFilterChange }) => (
            <select
              className="h-9 w-full rounded-xl border border-[#e4e4e7] px-3 text-sm"
              value={typeof value === "string" ? value : "all"}
              onChange={(e) => onFilterChange(e.target.value)}
            >
              <option value="all">{t("admin.products.filterAll")}</option>
              <option value="active">{t("admin.products.filterActive")}</option>
              <option value="inactive">{t("admin.products.filterInactive")}</option>
            </select>
          ),
        },
      },
      {
        id: "actions",
        header: t("admin.products.colActions"),
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2 whitespace-nowrap">
            <button
              type="button"
              className="text-[#527559]"
              onClick={() => setEditing(row.original)}
            >
              {t("admin.products.edit")}
            </button>
            <button
              type="button"
              className="text-red-600"
              onClick={() =>
                runAction(() => deleteProductAction(row.original.id), {
                  successMessage: t("notifications.productDeleted"),
                  onSuccess: () => refetch(),
                })
              }
            >
              {t("admin.products.delete")}
            </button>
          </div>
        ),
      },
    ],
    [t, runAction, stockDrafts, formatLocalizedPrice],
  );

  return (
    <AdminShell
      title={t("admin.products.title")}
      subtitle={t("admin.products.subtitle")}
    >
      <div className="grid gap-8 xl:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm xl:col-span-2"
        >
          <h2 className="font-semibold">
            {editing ? t("admin.products.editProduct") : t("admin.products.newProduct")}
          </h2>

          {imageUrl && (
            <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-[#f4f4f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
            </div>
          )}

          <input
            {...form.register("name")}
            placeholder={t("admin.products.namePlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          />
          <input
            {...form.register("slug")}
            placeholder={t("admin.products.slugPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            dir="ltr"
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#71717a]">
                {t("admin.products.descriptionSection")}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                disabled={isActionPending}
                onClick={() => {
                  const name = form.getValues("name").trim();
                  if (!name) {
                    notifyFormError(t("admin.products.validationName"), {
                      title: t("notifications.errorTitle"),
                    });
                    return;
                  }
                  const cat = categories.find((c) => c.id === form.getValues("category_id"));
                  runAction(
                    () => generateProductDescriptionAction({ name, category: cat?.name }),
                    {
                      onSuccess: (data) => {
                        if (!data) return;
                        form.setValue("description_fa", data.description_fa);
                        form.setValue("description_ar", data.description_ar);
                        form.setValue("description_en", data.description_en);
                      },
                    },
                  );
                }}
              >
                {t("admin.products.aiDescriptionAll")}
              </Button>
            </div>
            <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1">
              {DESCRIPTION_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    descriptionTab === tab.key
                      ? "bg-white text-[#18181b] shadow-sm"
                      : "text-[#71717a] hover:text-[#18181b]"
                  }`}
                  onClick={() => setDescriptionTab(tab.key)}
                >
                  {t(`admin.products.${tab.labelKey}`)}
                </button>
              ))}
            </div>
            <textarea
              key={descriptionTab}
              {...form.register(
                descriptionTab === "fa"
                  ? "description_fa"
                  : descriptionTab === "ar"
                    ? "description_ar"
                    : "description_en",
              )}
              placeholder={t("admin.products.descriptionPlaceholder")}
              className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              rows={4}
              dir={DESCRIPTION_TABS.find((tab) => tab.key === descriptionTab)?.dir ?? "rtl"}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.products.priceLabel")}
              </label>
              <input
                {...form.register("price", { valueAsNumber: true })}
                type="number"
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.products.compareAtPriceLabel")}
              </label>
              <input
                {...form.register("compare_at_price", { valueAsNumber: true })}
                type="number"
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-[#71717a]">
              {t("admin.products.stockLabel")}
            </label>
            <input
              {...form.register("stock", { valueAsNumber: true })}
              type="number"
              className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            />
          </div>

          <select
            {...form.register("category_id")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          >
            <option value="">{t("admin.products.noCategory")}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            {...form.register("brand_id")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          >
            <option value="">{t("admin.products.noBrand")}</option>
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <div className="space-y-2 rounded-xl border border-[#e4e4e7] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#71717a]">
                {t("admin.products.featuresSection")}
              </p>
              <Button
                type="button"
                variant="secondary"
                className="text-xs"
                onClick={() => setFeatures((current) => [...current, { ...EMPTY_FEATURE }])}
              >
                {t("admin.products.addFeature")}
              </Button>
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    value={feature.label}
                    onChange={(event) =>
                      setFeatures((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, label: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder={t("admin.products.featureLabelPlaceholder")}
                    className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2 text-sm"
                  />
                  <input
                    value={feature.value}
                    onChange={(event) =>
                      setFeatures((current) =>
                        current.map((item, itemIndex) =>
                          itemIndex === index
                            ? { ...item, value: event.target.value }
                            : item,
                        ),
                      )
                    }
                    placeholder={t("admin.products.featureValuePlaceholder")}
                    className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-[#e4e4e7] px-3 py-2 text-xs text-red-600"
                    onClick={() =>
                      setFeatures((current) =>
                        current.length <= 1
                          ? [{ ...EMPTY_FEATURE }]
                          : current.filter((_, itemIndex) => itemIndex !== index),
                      )
                    }
                  >
                    {t("admin.products.removeFeature")}
                  </button>
                </div>
              ))}
            </div>
          </div>

          <input type="hidden" {...form.register("blur_hash")} />

          <input
            {...form.register("image_url")}
            placeholder={t("admin.products.imageUrlPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            dir="ltr"
          />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} />{" "}
            {t("admin.products.showInStore")}
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isActionPending || isUploadPending}>
              {editing ? t("admin.products.save") : t("admin.products.create")}
            </Button>
            {editing && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setEditing(null);
                  setFeatures([{ ...EMPTY_FEATURE }]);
                }}
              >
                {t("admin.products.cancel")}
              </Button>
            )}
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                <AppIcon icon={Upload} size="sm" />
                {t("admin.products.uploadImage")}
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
                  uploadImage(file, "products", {
                    successMessage: t("notifications.imageUploaded"),
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                      if (data?.blurHash) {
                        form.setValue("blur_hash", data.blurHash);
                      }
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
                  runAction(() => editProductImageWithAiAction(imageUrl), {
                    successMessage: "AI",
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                    },
                  });
                }}
              >
                {t("admin.products.aiImage")}
              </Button>
            )}
          </div>
        </form>

        <div className="xl:col-span-3">
          <DataTable
            data={tableData}
            columns={columns}
            entityName={t("admin.products.entityName")}
            isSkeleton={isSkeleton}
            onRefresh={() => void refetch()}
            columnSizingStorageKey="admin-products"
            onExport={async () =>
              (products ?? []).map((p) => ({
                name: p.name,
                slug: p.slug,
                price: p.price,
                stock: p.stock,
                status: p.is_active
                  ? t("admin.products.active")
                  : t("admin.products.inactive"),
              }))
            }
          />
        </div>
      </div>
    </AdminShell>
  );
}
