"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  createProductAction,
  deleteProductAction,
  getCategoriesAction,
  updateProductAction,
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

  return (
    <AdminShell title="محصولات">
      <div className="grid gap-8 lg:grid-cols-2">
        <form onSubmit={onSubmit} className="space-y-3 rounded-xl border p-4">
          <h2 className="font-semibold">{editing ? "ویرایش محصول" : "محصول جدید"}</h2>
          <input {...form.register("name")} placeholder="نام" className="w-full rounded border px-3 py-2" />
          <input {...form.register("slug")} placeholder="slug" className="w-full rounded border px-3 py-2" dir="ltr" />
          <textarea {...form.register("description")} placeholder="توضیحات" className="w-full rounded border px-3 py-2" rows={3} />
          <div className="grid grid-cols-2 gap-2">
            <input {...form.register("price", { valueAsNumber: true })} type="number" placeholder="قیمت" className="rounded border px-3 py-2" />
            <input {...form.register("stock", { valueAsNumber: true })} type="number" placeholder="موجودی" className="rounded border px-3 py-2" />
          </div>
          <select {...form.register("category_id")} className="w-full rounded border px-3 py-2">
            <option value="">بدون دسته</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <input {...form.register("image_url")} placeholder="URL تصویر" className="w-full rounded border px-3 py-2" dir="ltr" />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register("is_active")} /> فعال
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="submit" disabled={isPending}>{editing ? "ذخیره" : "ایجاد"}</Button>
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
              تولید توضیحات AI
            </Button>
            <label className="cursor-pointer">
              <span className="inline-flex items-center justify-center rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm">آپلود تصویر</span>
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
            {form.watch("image_url") && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  const url = form.getValues("image_url") ?? "";
                  runAction(() => editProductImageWithAiAction(url), {
                    successMessage: "AI (stub)",
                    onSuccess: (data) => {
                      if (data?.url) form.setValue("image_url", data.url);
                    },
                  });
                }}
              >
                ویرایش تصویر AI
              </Button>
            )}
          </div>
        </form>

        <div className="overflow-x-auto rounded-xl border">
          <table className="min-w-full text-sm">
            <thead className="bg-zinc-50">
              <tr>
                <th className="p-3 text-right">نام</th>
                <th className="p-3 text-right">قیمت</th>
                <th className="p-3 text-right">موجودی</th>
                <th className="p-3 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={4} className="p-4 text-zinc-500">بارگذاری…</td></tr>
              )}
              {products?.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3">{Number(p.price).toLocaleString("fa-IR")}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3 space-x-2 space-x-reverse">
                    <button type="button" className="text-emerald-700" onClick={() => setEditing(p)}>ویرایش</button>
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={() =>
                        runAction(() => deleteProductAction(p.id), {
                          successMessage: "حذف شد",
                          onSuccess: () => refetch(),
                        })
                      }
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
