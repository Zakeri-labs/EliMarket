"use server";

import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { Category, Product } from "@/app/_types/database.types";

export async function getProductsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Product[] };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری محصولات ناموفق بود"),
    };
  }
}

export async function getCategoriesAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order");
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Category[] };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری دسته‌بندی‌ها ناموفق بود"),
    };
  }
}

export async function getProductBySlugAction(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error("محصول یافت نشد");
    return { success: true as const, data: data as Product };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "محصول یافت نشد"),
    };
  }
}

export async function getAdminProductsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Product[] };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری محصولات ادمین ناموفق بود"),
    };
  }
}

export async function createProductAction(input: {
  name: string;
  slug: string;
  description?: string;
  price: number;
  currency?: string;
  stock: number;
  category_id?: string | null;
  image_url?: string | null;
  is_active?: boolean;
}) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        slug: input.slug,
        description: input.description ?? null,
        price: input.price,
        currency: input.currency ?? "IRR",
        stock: input.stock,
        category_id: input.category_id ?? null,
        image_url: input.image_url ?? null,
        is_active: input.is_active ?? true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Product };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "ایجاد محصول ناموفق بود"),
    };
  }
}

export async function updateProductAction(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string | null;
    price: number;
    stock: number;
    category_id: string | null;
    image_url: string | null;
    is_active: boolean;
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("products")
      .update(input)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Product };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "ویرایش محصول ناموفق بود"),
    };
  }
}

export async function deleteProductAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "حذف محصول ناموفق بود"),
    };
  }
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error("فایلی انتخاب نشده است");

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return { success: true as const, data: { url: data.publicUrl } };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "آپلود تصویر ناموفق بود"),
    };
  }
}
