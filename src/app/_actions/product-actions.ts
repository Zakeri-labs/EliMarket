"use server";

import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { Category, Product, ProductFeatureInput } from "@/app/_types/database.types";
import { generateBlurHashFromFile } from "@/lib/images/generate-blur-hash";
import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_SELECT =
  "*, category:categories(*), brand:brands(*), features:product_features(*)";

function sortProductFeatures(product: Product): Product {
  if (!product.features?.length) return product;
  return {
    ...product,
    features: [...product.features].sort((a, b) => a.sort_order - b.sort_order),
  };
}

async function syncProductFeatures(
  supabase: SupabaseClient,
  productId: string,
  features?: ProductFeatureInput[],
) {
  const { error: deleteError } = await supabase
    .from("product_features")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  const rows = (features ?? [])
    .map((feature) => ({
      label: feature.label.trim(),
      value: feature.value.trim(),
    }))
    .filter((feature) => feature.label && feature.value);

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("product_features").insert(
    rows.map((row, index) => ({
      product_id: productId,
      label: row.label,
      value: row.value,
      sort_order: index,
    })),
  );
  if (insertError) throw insertError;
}

export async function getProductsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("name");
    if (error) throw error;
    return {
      success: true as const,
      data: ((data ?? []) as Product[]).map(sortProductFeatures),
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productsLoadFailed", err),
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
      error: await actionErrorMessage("errors.categoriesLoadFailed", err),
    };
  }
}

export async function getProductBySlugAction(slug: string) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.productNotFound"));
    return { success: true as const, data: sortProductFeatures(data as Product) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productNotFound", err),
    };
  }
}

export async function getAdminProductsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return {
      success: true as const,
      data: ((data ?? []) as Product[]).map(sortProductFeatures),
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.adminProductsLoadFailed", err),
    };
  }
}

export async function createProductAction(input: {
  name: string;
  slug: string;
  description?: string;
  description_fa?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  price: number;
  compare_at_price?: number | null;
  currency?: string;
  stock: number;
  category_id?: string | null;
  brand_id?: string | null;
  image_url?: string | null;
  blur_hash?: string | null;
  is_active?: boolean;
  features?: ProductFeatureInput[];
}) {
  try {
    const { supabase } = await requireAdmin();
    const description_fa = input.description_fa?.trim() || input.description?.trim() || null;
    const description_ar = input.description_ar?.trim() || null;
    const description_en = input.description_en?.trim() || null;
    const { data, error } = await supabase
      .from("products")
      .insert({
        name: input.name,
        slug: input.slug,
        description: description_fa ?? description_ar ?? description_en ?? null,
        description_fa,
        description_ar,
        description_en,
        price: input.price,
        compare_at_price: input.compare_at_price ?? null,
        currency: input.currency ?? "IRR",
        stock: input.stock,
        category_id: input.category_id ?? null,
        brand_id: input.brand_id ?? null,
        image_url: input.image_url ?? null,
        blur_hash: input.blur_hash ?? null,
        is_active: input.is_active ?? true,
      })
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw error;
    await syncProductFeatures(supabase, data.id, input.features);
    const refreshed = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", data.id)
      .single();
    if (refreshed.error) throw refreshed.error;
    return { success: true as const, data: sortProductFeatures(refreshed.data as Product) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productCreateFailed", err),
    };
  }
}

export async function updateProductAction(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    description: string | null;
    description_fa: string | null;
    description_ar: string | null;
    description_en: string | null;
    price: number;
    compare_at_price: number | null;
    stock: number;
    category_id: string | null;
    brand_id: string | null;
    image_url: string | null;
    blur_hash: string | null;
    is_active: boolean;
    features: ProductFeatureInput[];
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    const { features, ...rest } = input;
    const patch = { ...rest };

    if (
      patch.description_fa !== undefined ||
      patch.description_ar !== undefined ||
      patch.description_en !== undefined
    ) {
      const fa = patch.description_fa?.trim() || null;
      const ar = patch.description_ar?.trim() || null;
      const en = patch.description_en?.trim() || null;
      patch.description_fa = fa;
      patch.description_ar = ar;
      patch.description_en = en;
      patch.description = fa ?? ar ?? en;
    }

    const { data, error } = await supabase
      .from("products")
      .update(patch)
      .eq("id", id)
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw error;

    if (features !== undefined) {
      await syncProductFeatures(supabase, id, features);
      const refreshed = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .single();
      if (refreshed.error) throw refreshed.error;
      return { success: true as const, data: sortProductFeatures(refreshed.data as Product) };
    }

    return { success: true as const, data: sortProductFeatures(data as Product) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productUpdateFailed", err),
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
      error: await actionErrorMessage("errors.productDeleteFailed", err),
    };
  }
}

export async function updateProductStockAction(id: string, stock: number) {
  return updateProductAction(id, { stock: Math.max(0, Math.floor(stock)) });
}

export async function uploadProductImageAction(formData: FormData) {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error(await serverT("errors.noFileSelected"));

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blurHash = await generateBlurHashFromFile(file);

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { upsert: false });
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    return {
      success: true as const,
      data: { url: data.publicUrl, blurHash },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.imageUploadFailed", err),
    };
  }
}
