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
  uploadProductImageAction,
} from "@/app/_actions/product-actions";
import {
  editProductImageWithAiAction,
  generateProductDescriptionAction,
} from "@/app/_actions/ai-actions";
import { useAdminProducts } from "@/app/(admin)/dashboard/_hooks/use-admin-products";
import { useFormAction } from "@/app/hooks/use-form-action";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { ProductPlaceholder } from "@/components/icons/ProductPlaceholder";
import { DataTable } from "@/components/table";
import { formatPrice } from "@/config/brand";
import type { Category, Product } from "@/app/_types/database.types";

const schema = z.object({
  name: z.string().min(1, "نام الزامی است"),
  slug: z.string().min(1, "اسلاگ الزامی است"),
  description: z.string().optional(),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  category_id: z.string().optional(),
  image_url: z.string().optional(),
  is_active: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export default function AdminProductsPage() {
  const { data: products, refetch, isLoading } = useAdminProducts();
  const { runAction, isPending } = useFormAction();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Product | null>(null);
  const [stockDrafts, setStockDrafts] = useState<Record<string, string>>({});

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      stock: 0,
      category_id: "",
      image_url: "",
      is_active: true,
    },
  });

  const imageUrl = form.watch("image_url");

  useEffect(() => {
    getCategoriesAction().then((r) => {
      if (r.success && r.data) setCategories(r.data);
    });
  }, []);

  useEffect(() => {
    if (editing) {
      form.reset({
        name: editing.name,
        slug: editing.slug,
        description: editing.description ?? "",
        price: Number(editing.price),
        stock: editing.stock,
        category_id: editing.category_id ?? "",
        image_url: editing.image_url ?? "",
        is_active: editing.is_active,
      });
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
      description: values.description || undefined,
      image_url: values.image_url || null,
    };

    if (editing) {
      runAction(() => updateProductAction(editing.id, payload), {
        successMessage: "محصول ویرایش شد",
        onSuccess: () => {
          setEditing(null);
          form.reset();
          refetch();
        },
      });
    } else {
      runAction(() => createProductAction(payload), {
        successMessage: "محصول ایجاد شد",
        onSuccess: () => {
          form.reset();
          refetch();
        },
      });
    }
  });

  const saveStock = (productId: string) => {
    const value = Number(stockDrafts[productId]);
    if (Number.isNaN(value) || value < 0) return;
    runAction(() => updateProductStockAction(productId, value), {
      successMessage: "موجودی به‌روز شد",
      onSuccess: () => refetch(),
    });
  };

  const columns = useMemo<ColumnDef<Product>[]>(
    () => [
      {
        accessorKey: "image_url",
        header: "تصویر",
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
        header: "نام",
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
        header: "قیمت",
        cell: ({ getValue }) => (
          <span className="whitespace-nowrap">{formatPrice(Number(getValue()))}</span>
        ),
      },
      {
        accessorKey: "stock",
        header: "موجودی",
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
        header: "وضعیت",
        cell: ({ row }) => (
          <div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs ${
                row.original.is_active
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {row.original.is_active ? "فعال" : "غیرفعال"}
            </span>
            {row.original.stock === 0 && (
              <span className="mt-1 block text-xs text-red-600">ناموجود</span>
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
              <option value="all">همه</option>
              <option value="active">فعال</option>
              <option value="inactive">غیرفعال</option>
            </select>
          ),
        },
      },
      {
        id: "actions",
        header: "عملیات",
        enableSorting: false,
        enableColumnFilter: false,
        cell: ({ row }) => (
          <div className="flex gap-2 whitespace-nowrap">
            <button
              type="button"
              className="text-[#527559]"
              onClick={() => setEditing(row.original)}
            >
              ویرایش
            </button>
            <button
              type="button"
              className="text-red-600"
              onClick={() =>
                runAction(() => deleteProductAction(row.original.id), {
                  successMessage: "حذف شد",
                  onSuccess: () => refetch(),
                })
              }
            >
              حذف
            </button>
          </div>
        ),
      },
    ],
    [runAction, stockDrafts],
  );

  return (
    <AdminShell
      title="مدیریت محصولات"
      subtitle="افزودن محصول، بارگذاری تصویر و کنترل موجودی"
    >
      <div className="grid gap-8 xl:grid-cols-5">
        <form
          onSubmit={onSubmit}
          className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm xl:col-span-2"
        >
          <h2 className="font-semibold">{editing ? "ویرایش محصول" : "محصول جدید"}</h2>

          {imageUrl && (
            <div className="overflow-hidden rounded-xl border border-[#e4e4e7] bg-[#f4f4f5]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="aspect-video w-full object-cover" />
            </div>
          )}

          <input {...form.register("name")} placeholder="نام محصول" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" />
          <input {...form.register("slug")} placeholder="slug-en" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" dir="ltr" />
          <textarea {...form.register("description")} placeholder="توضیحات" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" rows={3} />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">قیمت (تومان)</label>
              <input {...form.register("price", { valueAsNumber: true })} type="number" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#71717a]">موجودی</label>
              <input {...form.register("stock", { valueAsNumber: true })} type="number" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" />
            </div>
          </div>

          <select {...form.register("category_id")} className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm">
            <option value="">بدون دسته</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <input {...form.register("image_url")} placeholder="URL تصویر (یا آپلود کنید)" className="w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm" dir="ltr" />

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} /> نمایش در فروشگاه
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>{editing ? "ذخیره" : "ایجاد محصول"}</Button>
            {editing && (
              <Button type="button" variant="secondary" onClick={() => setEditing(null)}>انصراف</Button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                const name = form.getValues("name");
                const cat = categories.find((c) => c.id === form.getValues("category_id"));
                runAction(() => generateProductDescriptionAction({ name, category: cat?.name }), {
                  onSuccess: (data) => {
                    if (data?.description) form.setValue("description", data.description);
                  },
                });
              }}
            >
              AI توضیحات
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center gap-2 rounded-md border border-[#e4e4e7] bg-white px-4 py-2 text-sm">
                <AppIcon icon={Upload} size="sm" />
                آپلود تصویر
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const fd = new FormData();
                  fd.set("file", file);
                  runAction(() => uploadProductImageAction(fd), {
                    successMessage: "تصویر آپلود شد",
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                    },
                  });
                }}
              />
            </label>
            {imageUrl && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  runAction(() => editProductImageWithAiAction(imageUrl), {
                    successMessage: "AI (stub)",
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                    },
                  });
                }}
              >
                AI تصویر
              </Button>
            )}
          </div>
        </form>

        <div className="xl:col-span-3">
          <DataTable
            data={products ?? []}
            columns={columns}
            entityName="محصولات"
            isLoading={isLoading}
            onRefresh={() => void refetch()}
            columnSizingStorageKey="admin-products"
            onExport={async () =>
              (products ?? []).map((p) => ({
                نام: p.name,
                slug: p.slug,
                قیمت: p.price,
                موجودی: p.stock,
                وضعیت: p.is_active ? "فعال" : "غیرفعال",
              }))
            }
          />
        </div>
      </div>
    </AdminShell>
  );
}
