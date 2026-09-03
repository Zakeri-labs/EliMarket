"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Sparkles, Star, Upload } from "lucide-react";
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
} from "@/app/hooks/use-admin-image-upload";
import { completeImageUploadAction } from "@/app/_actions/image-actions";
import { flattenCategoryTree, categoryDepth } from "@/lib/categories/tree";
import { isLowStock, INVENTORY_UNITS } from "@/lib/products/inventory";
import { notifyFormError } from "@/app/utils/form-notify";
import { uploadImageFileToStorage } from "@/lib/storage/upload-image-client";
import type {
  Brand,
  Category,
  InventoryUnit,
  Product,
  ProductFeatureInput,
  ProductImageInput,
} from "@/app/_types/database.types";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MoneyInput } from "@/components/ui/MoneyInput";
import { RowIconActions } from "@/components/admin/RowIconActions";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { Spinner } from "@/components/ui/Spinner";
import { productCover } from "@/lib/products/gallery";
import { DataTable } from "@/components/table";
import { mockAdminTableProducts } from "@/app/(admin)/dashboard/_mocks/product-table-mock";
import { useTranslations } from "@/i18n/use-translations";
import { Price } from "@/components/ui/Price";

type FeatureDraft = ProductFeatureInput;
type GalleryItem = ProductImageInput;

const EMPTY_FEATURE: FeatureDraft = {
  label_fa: "",
  label_ar: "",
  label_en: "",
  value_fa: "",
  value_ar: "",
  value_en: "",
};
const MAX_GALLERY_IMAGES = 8;

function galleryFromProduct(product: Product): GalleryItem[] {
  if (product.images?.length) {
    return [...product.images]
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => ({
        image_url: image.image_url,
        blur_hash: image.blur_hash,
      }));
  }
  if (product.image_url) {
    return [{ image_url: product.image_url, blur_hash: product.blur_hash }];
  }
  return [];
}

type DescriptionLocale = "fa" | "ar" | "en";

const DESCRIPTION_TABS: { key: DescriptionLocale; labelKey: "descriptionFa" | "descriptionAr" | "descriptionEn"; dir: "rtl" | "ltr" }[] = [
  { key: "fa", labelKey: "descriptionFa", dir: "rtl" },
  { key: "ar", labelKey: "descriptionAr", dir: "rtl" },
  { key: "en", labelKey: "descriptionEn", dir: "ltr" },
];

type FormValues = {
  name: string;
  name_ar?: string;
  name_en?: string;
  slug: string;
  description_fa?: string;
  description_ar?: string;
  description_en?: string;
  price?: number;
  compare_at_price?: number;
  stock: number;
  inventory_unit: InventoryUnit;
  low_stock_threshold: number;
  category_id?: string;
  brand_id?: string;
  image_url?: string;
  blur_hash?: string;
  is_active: boolean;
  sku?: string;
  parent_product_id?: string;
  variant_label?: string;
};

const DEFAULT_FORM_VALUES: FormValues = {
  name: "",
  name_ar: "",
  name_en: "",
  slug: "",
  description_fa: "",
  description_ar: "",
  description_en: "",
  price: undefined,
  compare_at_price: undefined,
  stock: 0,
  inventory_unit: "count",
  low_stock_threshold: 5,
  category_id: "",
  brand_id: "",
  image_url: "",
  blur_hash: "",
  is_active: true,
  sku: "",
  parent_product_id: "",
  variant_label: "",
};

export default function AdminProductsPage() {
  const { data: products, refetch, isPending: isProductsPending } = useAdminProducts();
  const { runAction, isPending: isActionPending } = useFormAction();
  const { t } = useTranslations();
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});
  const [descriptionTab, setDescriptionTab] = useState<DescriptionLocale>("fa");
  const [featuresTab, setFeaturesTab] = useState<DescriptionLocale>("fa");
  const [features, setFeatures] = useState<FeatureDraft[]>([{ ...EMPTY_FEATURE }]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [galleryBusy, setGalleryBusy] = useState(false);
  const [imageUrlDraft, setImageUrlDraft] = useState("");

  const schema = useMemo(
    () =>
      z.object({
        name: z.string().min(1, t("admin.products.validationName")),
        name_ar: z.string().optional(),
        name_en: z.string().optional(),
        slug: z.string().min(1, t("admin.products.validationSlug")),
        description_fa: z.string().optional(),
        description_ar: z.string().optional(),
        description_en: z.string().optional(),
        price: z.number().optional(),
        compare_at_price: z.number().optional(),
        stock: z.number().int().min(0),
        inventory_unit: z.enum(["count", "weight", "pack"]),
        low_stock_threshold: z.number().int().min(0),
        category_id: z.string().optional(),
        brand_id: z.string().optional(),
        image_url: z.string().optional(),
        blur_hash: z.string().optional(),
        is_active: z.boolean(),
        sku: z.string().optional(),
        parent_product_id: z.string().optional(),
        variant_label: z.string().optional(),
      }).superRefine((data, ctx) => {
        if (data.price == null || !Number.isFinite(data.price) || data.price <= 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("admin.products.validationPrice"),
            path: ["price"],
          });
        }
        if (
          data.compare_at_price == null ||
          !Number.isFinite(data.compare_at_price) ||
          data.compare_at_price <= 0
        ) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("admin.products.validationCompareAt"),
            path: ["compare_at_price"],
          });
        } else if (data.price != null && data.compare_at_price < data.price) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t("admin.products.validationCompareAtMin"),
            path: ["compare_at_price"],
          });
        }
      }),
    [t],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    getCategoriesAction().then((r) => {
      if (r.success && r.data) setCategories(r.data);
    });
    getAdminBrandsAction().then((r) => {
      if (r.success && r.data) setBrands(r.data);
    });
  }, []);

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    form.reset(DEFAULT_FORM_VALUES);
    setFeatures([{ ...EMPTY_FEATURE }]);
    setGallery([]);
    setImageUrlDraft("");
  };

  const openCreate = () => {
    setEditing(null);
    form.reset(DEFAULT_FORM_VALUES);
    setFeatures([{ ...EMPTY_FEATURE }]);
    setGallery([]);
    setImageUrlDraft("");
    setDescriptionTab("fa");
    setFeaturesTab("fa");
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    form.reset({
      name: product.name_fa ?? product.name,
      name_ar: product.name_ar ?? "",
      name_en: product.name_en ?? "",
      slug: product.slug,
      description_fa: product.description_fa ?? product.description ?? "",
      description_ar: product.description_ar ?? "",
      description_en: product.description_en ?? "",
      price: Number(product.price),
      compare_at_price: product.compare_at_price ? Number(product.compare_at_price) : undefined,
      stock: product.stock,
      inventory_unit: product.inventory_unit ?? "count",
      low_stock_threshold: product.low_stock_threshold ?? 5,
      category_id: product.category_id ?? "",
      brand_id: product.brand_id ?? "",
      image_url: product.image_url ?? "",
      blur_hash: product.blur_hash ?? "",
      is_active: product.is_active,
      sku: product.sku ?? "",
      parent_product_id: product.parent_product_id ?? "",
      variant_label: product.variant_label ?? "",
    });
    setFeatures(
      product.features?.length
        ? product.features.map((feature) => ({
            label_fa: feature.label_fa ?? feature.label,
            label_ar: feature.label_ar ?? feature.label,
            label_en: feature.label_en ?? feature.label,
            value_fa: feature.value_fa ?? feature.value,
            value_ar: feature.value_ar ?? feature.value,
            value_en: feature.value_en ?? feature.value,
          }))
        : [{ ...EMPTY_FEATURE }],
    );
    setGallery(galleryFromProduct(product));
    setImageUrlDraft("");
    setDescriptionTab("fa");
    setFeaturesTab("fa");
    setFormOpen(true);
  };

  // Sync draft stock inputs when the query returns fresh data (initial load,
  // refetch after a save). Adjusted during render rather than in an effect
  // per https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [syncedProducts, setSyncedProducts] = useState<Product[] | undefined>(undefined);
  if (products && products !== syncedProducts) {
    setSyncedProducts(products);
    setStockDrafts(Object.fromEntries(products.map((p) => [p.id, String(p.stock)])));
  }

  const onSubmit = form.handleSubmit((values) => {
    const payload = {
      ...values,
      price: values.price as number,
      category_id: values.category_id || null,
      brand_id: values.brand_id || null,
      sku: values.sku?.trim() || null,
      parent_product_id: values.parent_product_id || null,
      variant_label: values.variant_label?.trim() || null,
      description_fa: values.description_fa?.trim() || null,
      description_ar: values.description_ar?.trim() || null,
      description_en: values.description_en?.trim() || null,
      image_url: gallery[0]?.image_url || null,
      blur_hash: gallery[0]?.blur_hash || null,
      compare_at_price: values.compare_at_price as number,
      images: gallery.filter((image) => image.image_url.trim()),
      features: features
        .map((feature) => ({
          label_fa: feature.label_fa.trim(),
          label_ar: feature.label_ar.trim(),
          label_en: feature.label_en.trim(),
          value_fa: feature.value_fa.trim(),
          value_ar: feature.value_ar.trim(),
          value_en: feature.value_en.trim(),
        }))
        .filter((feature) => feature.label_fa && feature.value_fa),
    };

    if (editing) {
      runAction(() => updateProductAction(editing.id, payload), {
        successMessage: t("notifications.productUpdated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    } else {
      runAction(() => createProductAction(payload), {
        successMessage: t("notifications.productCreated"),
        onSuccess: () => {
          closeForm();
          refetch();
        },
      });
    }
  });

  const addGalleryItem = (item: GalleryItem) => {
    setGallery((current) => {
      if (current.length >= MAX_GALLERY_IMAGES) return current;
      if (current.some((image) => image.image_url === item.image_url)) return current;
      return [...current, item];
    });
  };

  const uploadGalleryFiles = async (list: FileList | null) => {
    if (!list) return;
    setGalleryBusy(true);
    let remaining = MAX_GALLERY_IMAGES - gallery.length;
    try {
      for (const file of Array.from(list)) {
        if (remaining <= 0) break;
        if (!file.type.startsWith("image/")) continue;
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          notifyFormError(t("errors.fileTooLarge"), {
            title: t("notifications.errorTitle"),
          });
          continue;
        }
        const { url } = await uploadImageFileToStorage(file, "products");
        const completed = await completeImageUploadAction(url);
        if (!completed.success || !completed.data?.url) {
          notifyFormError(completed.error ?? t("errors.imageUploadFailed"), {
            title: t("notifications.errorTitle"),
          });
          continue;
        }
        addGalleryItem({
          image_url: completed.data.url,
          blur_hash: completed.data.blurHash,
        });
        remaining -= 1;
      }
    } catch (err) {
      const isNetworkError = err instanceof TypeError && /fetch/i.test(err.message);
      notifyFormError(
        isNetworkError
          ? t("errors.networkError")
          : err instanceof Error
            ? err.message
            : t("errors.imageUploadFailed"),
        { title: t("notifications.errorTitle") },
      );
    } finally {
      setGalleryBusy(false);
    }
  };

  const addImageFromUrl = () => {
    const url = imageUrlDraft.trim();
    if (!url) return;
    addGalleryItem({ image_url: url, blur_hash: null });
    setImageUrlDraft("");
  };

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
        cell: ({ row }) => {
          const cover = productCover(row.original);
          return (
          <div className="h-12 w-12 overflow-hidden rounded-lg bg-[#f4f4f5]">
            {cover ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.image_url}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              <ProductPlaceholder size="md" />
            )}
          </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: t("admin.products.colName"),
        cell: ({ row }) => (
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-medium">{row.original.name}</p>
              {(row.original.generation_status === "pending" ||
                row.original.generation_status === "generating") && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  <Spinner size="sm" className="text-amber-700" />
                  {t("admin.products.generatingBadge")}
                </span>
              )}
              {row.original.generation_status === "failed" && (
                <span
                  className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700"
                  title={row.original.generation_error ?? undefined}
                >
                  {t("admin.products.generationFailedBadge")}
                </span>
              )}
              {row.original.generation_status === "completed" && !row.original.is_active && (
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                  {t("admin.products.needsImageReviewBadge")}
                </span>
              )}
            </div>
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
          <Price amount={Number(getValue())} />
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
              title={t("admin.products.saveStock")}
              aria-label={t("admin.products.saveStock")}
              className="inline-flex h-8 min-w-8 items-center justify-center rounded-md bg-[#0d9488] text-white transition-colors hover:bg-[#0f766e] disabled:opacity-50"
              disabled={isActionPending}
              onClick={() => saveStock(row.original.id)}
            >
              {isActionPending ? (
                <Spinner size="sm" />
              ) : (
                <AppIcon icon={Check} size="xs" />
              )}
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
            {isLowStock(row.original) && (
              <span className="mt-1 block text-xs text-amber-600">
                {t("admin.products.lowStock")}
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
          <RowIconActions
            editLabel={t("admin.products.edit")}
            deleteLabel={t("admin.products.delete")}
            onEdit={() => openEdit(row.original)}
            onDelete={() =>
              runAction(() => deleteProductAction(row.original.id), {
                successMessage: t("notifications.productDeleted"),
                onSuccess: () => refetch(),
              })
            }
          />
        ),
      },
    ],
    [t, runAction, stockDrafts, openEdit],
  );

  return (
    <AdminShell
      title={t("admin.products.title")}
      subtitle={t("admin.products.subtitle")}
    >
      <div className="space-y-4">
        <Link
          href="/dashboard/products/smart"
          className="flex items-center justify-between gap-3 rounded-2xl border border-[#0d9488]/40 bg-[#0d9488]/8 px-4 py-3"
        >
          <div>
            <p className="text-sm font-semibold text-[#0f766e]">{t("admin.products.smartRegister")}</p>
            <p className="text-xs text-[#71717a]">{t("admin.smartProduct.subtitle")}</p>
          </div>
          <span className="shrink-0 text-sm font-medium text-[#0d9488]">→</span>
        </Link>
        <Modal
          open={formOpen}
          onOpenChange={(open) => {
            if (open) setFormOpen(true);
            else closeForm();
          }}
          title={editing ? t("admin.products.editProduct") : t("admin.products.newProduct")}
          size="lg"
          busy={isActionPending || galleryBusy}
          busyLabel={galleryBusy ? t("common.uploading") : t("common.saving")}
          footer={
            <>
              <Button type="button" variant="secondary" onClick={closeForm} disabled={isActionPending || galleryBusy}>
                {t("admin.products.cancel")}
              </Button>
              <Button
                type="submit"
                form="admin-product-form"
                loading={isActionPending || galleryBusy}
                loadingLabel={galleryBusy ? t("common.uploading") : t("common.saving")}
              >
                {editing ? t("admin.products.save") : t("admin.products.create")}
              </Button>
            </>
          }
        >
          <form
            id="admin-product-form"
            onSubmit={onSubmit}
            className="space-y-3"
          >
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
          <input
            key={`name-${descriptionTab}`}
            {...form.register(
              descriptionTab === "fa" ? "name" : descriptionTab === "ar" ? "name_ar" : "name_en",
            )}
            placeholder={t("admin.products.namePlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            dir={descriptionTab === "en" ? "ltr" : "rtl"}
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
                loading={isActionPending}
                loadingLabel={t("common.processing")}
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
                        form.setValue("name_ar", data.name_ar);
                        form.setValue("name_en", data.name_en);
                      },
                    },
                  );
                }}
              >
                {t("admin.products.aiDescriptionAll")}
              </Button>
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
            <Controller
              control={form.control}
              name="price"
              render={({ field, fieldState }) => (
                <div>
                  <label className="mb-1 block text-xs text-[#71717a]">
                    {t("admin.products.priceLabel")}
                  </label>
                  <MoneyInput
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("admin.products.pricePlaceholder")}
                    className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
                  />
                  {fieldState.error ? (
                    <p className="mt-1 text-xs text-red-600">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
            <Controller
              control={form.control}
              name="compare_at_price"
              render={({ field, fieldState }) => (
                <div>
                  <label className="mb-1 block text-xs text-[#71717a]">
                    {t("admin.products.compareAtPriceLabel")}
                  </label>
                  <MoneyInput
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t("admin.products.pricePlaceholder")}
                    className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
                  />
                  {fieldState.error ? (
                    <p className="mt-1 text-xs text-red-600">{fieldState.error.message}</p>
                  ) : null}
                </div>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.products.stockLabel")}
              </label>
              <input
                {...form.register("stock", { valueAsNumber: true })}
                type="number"
                min={0}
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">
                {t("admin.products.inventoryUnit")}
              </label>
              <select
                {...form.register("inventory_unit")}
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
              >
                {INVENTORY_UNITS.map((unit) => (
                  <option key={unit} value={unit}>
                    {t(`admin.products.${unit === "count" ? "unitCount" : unit === "weight" ? "unitWeight" : "unitPack"}`)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#71717a]">
              {t("admin.products.lowStockThreshold")}
            </label>
            <input
              {...form.register("low_stock_threshold", { valueAsNumber: true })}
              type="number"
              min={0}
              className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            />
          </div>

          <select
            {...form.register("category_id")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          >
            <option value="">{t("admin.products.noCategory")}</option>
            {flattenCategoryTree(categories).map((c) => (
              <option key={c.id} value={c.id}>
                {`${"— ".repeat(categoryDepth(categories, c))}${c.name}`}
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

          <input
            {...form.register("sku")}
            placeholder={t("admin.products.skuPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
            dir="ltr"
          />

          <select
            {...form.register("parent_product_id")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          >
            <option value="">{t("admin.products.noVariantParent")}</option>
            {(products ?? [])
              .filter((p) => p.id !== editing?.id)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
          </select>

          <input
            {...form.register("variant_label")}
            placeholder={t("admin.products.variantLabelPlaceholder")}
            className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
          />

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
            <div className="flex gap-1 rounded-xl border border-[#e4e4e7] bg-[#fafafa] p-1">
              {DESCRIPTION_TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    featuresTab === tab.key
                      ? "bg-white text-[#18181b] shadow-sm"
                      : "text-[#71717a] hover:text-[#18181b]"
                  }`}
                  onClick={() => setFeaturesTab(tab.key)}
                >
                  {t(`admin.products.${tab.labelKey}`)}
                </button>
              ))}
            </div>
            <div className="space-y-2">
              {features.map((feature, index) => {
                const labelKey = `label_${featuresTab}` as const;
                const valueKey = `value_${featuresTab}` as const;
                return (
                  <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <input
                      value={feature[labelKey]}
                      onChange={(event) =>
                        setFeatures((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, [labelKey]: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder={t("admin.products.featureLabelPlaceholder")}
                      className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2 text-sm"
                      dir={featuresTab === "en" ? "ltr" : "rtl"}
                    />
                    <input
                      value={feature[valueKey]}
                      onChange={(event) =>
                        setFeatures((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, [valueKey]: event.target.value }
                              : item,
                          ),
                        )
                      }
                      placeholder={t("admin.products.featureValuePlaceholder")}
                      className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2 text-sm"
                      dir={featuresTab === "en" ? "ltr" : "rtl"}
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
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-medium text-[#71717a]">
                {t("admin.products.imagesSection")}
              </p>
              <span className="text-[11px] text-[#71717a]">
                {t("admin.products.maxImages", { count: MAX_GALLERY_IMAGES })}
              </span>
            </div>
            <p className="text-xs leading-5 text-[#71717a]">{t("admin.products.imagesHint")}</p>
            {gallery.length > 0 && (
              <ul className="grid grid-cols-3 gap-2">
                {gallery.map((image, index) => (
                  <li
                    key={`${image.image_url}-${index}`}
                    className={`relative overflow-hidden rounded-xl border ${
                      index === 0 ? "border-[#0d9488] ring-2 ring-[#0d9488]/30" : "border-[#e4e4e7]"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image.image_url} alt="" className="aspect-square w-full bg-[#f4f4f5] object-contain" />
                    {index === 0 && (
                      <span className="absolute start-1 top-1 rounded-md bg-[#0d9488] px-1.5 py-0.5 text-[10px] font-medium text-white">
                        {t("admin.products.primaryImage")}
                      </span>
                    )}
                    <div className="absolute inset-x-0 bottom-0 flex gap-1 bg-black/55 p-1">
                      {index !== 0 && (
                        <button
                          type="button"
                          title={t("admin.products.setPrimaryImage")}
                          className="flex-1 rounded-md bg-white/95 px-1 py-1 text-[10px] text-[#0f766e]"
                          onClick={() =>
                            setGallery((current) => {
                              const next = [...current];
                              const [picked] = next.splice(index, 1);
                              return [picked, ...next];
                            })
                          }
                        >
                          <AppIcon icon={Star} size="xs" className="mx-auto" />
                        </button>
                      )}
                      <button
                        type="button"
                        title={t("admin.products.aiImage")}
                        className="flex-1 rounded-md bg-white/95 px-1 py-1 text-[10px] text-[#0f766e]"
                        onClick={() =>
                          runAction(
                            () =>
                              editProductImageWithAiAction(
                                image.image_url,
                                form.getValues("name")?.trim() || undefined,
                              ),
                            {
                              successMessage: t("admin.products.aiImage"),
                              onSuccess: (data) => {
                                if (!data?.url) return;
                                setGallery((current) =>
                                  current.map((item, itemIndex) =>
                                    itemIndex === index
                                      ? {
                                          image_url: data.url,
                                          blur_hash: data.blurHash ?? item.blur_hash,
                                        }
                                      : item,
                                  ),
                                );
                              },
                            },
                          )
                        }
                      >
                        <AppIcon icon={Sparkles} size="xs" className="mx-auto" />
                      </button>
                      <button
                        type="button"
                        className="flex-1 rounded-md bg-white/95 px-1 py-1 text-[10px] text-red-600"
                        onClick={() =>
                          setGallery((current) => current.filter((_, itemIndex) => itemIndex !== index))
                        }
                      >
                        {t("admin.products.removeImage")}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex flex-wrap gap-2">
              <label className="cursor-pointer">
                <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                  <AppIcon icon={Upload} size="sm" />
                  {t("admin.products.uploadImages")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={galleryBusy || gallery.length >= MAX_GALLERY_IMAGES}
                  onChange={(event) => {
                    void uploadGalleryFiles(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>
            <div className="flex gap-2">
              <input
                value={imageUrlDraft}
                onChange={(event) => setImageUrlDraft(event.target.value)}
                placeholder={t("admin.products.imageUrlPlaceholder")}
                className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm"
                dir="ltr"
              />
              <Button type="button" variant="secondary" onClick={addImageFromUrl}>
                {t("admin.products.addImageUrl")}
              </Button>
            </div>
          </div>

          <input type="hidden" {...form.register("blur_hash")} />
          <input type="hidden" {...form.register("image_url")} />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} />{" "}
            {t("admin.products.showInStore")}
          </label>
          </form>
        </Modal>

        <DataTable
            data={tableData}
            columns={columns}
            entityName={t("admin.products.entityName")}
            isSkeleton={isSkeleton}
            onRefresh={() => void refetch()}
            onCreateClick={openCreate}
            createLabel={t("admin.products.newProduct")}
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
    </AdminShell>
  );
}
