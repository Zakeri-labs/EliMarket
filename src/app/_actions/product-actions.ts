"use server";

import { DEFAULT_CURRENCY } from "@/config/brand";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type {
  Category,
  Product,
  ProductFeatureInput,
  ProductImageInput,
  ProductVariantOption,
  InventoryUnit,
} from "@/app/_types/database.types";
import { generateBlurHashFromFile } from "@/lib/images/generate-blur-hash";
import { applyLiveCampaigns, applyLiveCampaignsToProducts } from "@/lib/campaigns/apply";
import { loadActiveCampaigns } from "@/lib/campaigns/load";
import type { SupabaseClient } from "@supabase/supabase-js";

const PRODUCT_SELECT_CORE =
  "*, category:categories(*), brand:brands(*), features:product_features(*)";
const PRODUCT_SELECT = `${PRODUCT_SELECT_CORE}, images:product_images(*)`;

function isMissingProductImagesRelation(error: { message?: string; details?: string; hint?: string }) {
  const text = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return text.includes("product_images");
}

function hydrateProduct(product: Product): Product {
  const sorted = sortProductFeatures(product);
  if (!sorted.images?.length) return sorted;
  return {
    ...sorted,
    images: [...sorted.images].sort((a, b) => a.sort_order - b.sort_order),
  };
}

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
      label_fa: feature.label_fa.trim(),
      label_ar: feature.label_ar.trim(),
      label_en: feature.label_en.trim(),
      value_fa: feature.value_fa.trim(),
      value_ar: feature.value_ar.trim(),
      value_en: feature.value_en.trim(),
    }))
    .filter((feature) => feature.label_fa && feature.value_fa);

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("product_features").insert(
    rows.map((row, index) => ({
      product_id: productId,
      label: row.label_fa,
      value: row.value_fa,
      label_fa: row.label_fa,
      label_ar: row.label_ar,
      label_en: row.label_en,
      value_fa: row.value_fa,
      value_ar: row.value_ar,
      value_en: row.value_en,
      sort_order: index,
    })),
  );
  if (insertError) throw insertError;
}

async function syncProductImages(
  supabase: SupabaseClient,
  productId: string,
  images?: ProductImageInput[],
) {
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  if (deleteError) throw deleteError;

  const rows = (images ?? [])
    .map((image) => ({
      image_url: image.image_url.trim(),
      blur_hash: image.blur_hash?.trim() || null,
    }))
    .filter((image) => image.image_url);

  if (rows.length === 0) return;

  const { error: insertError } = await supabase.from("product_images").insert(
    rows.map((row, index) => ({
      product_id: productId,
      image_url: row.image_url,
      blur_hash: row.blur_hash,
      sort_order: index,
      is_primary: index === 0,
    })),
  );
  if (insertError) throw insertError;
}

function coverFromImages(images?: ProductImageInput[]) {
  const first = images?.find((image) => image.image_url.trim());
  return {
    image_url: first?.image_url.trim() || null,
    blur_hash: first?.blur_hash?.trim() || null,
  };
}

export async function getProductsAction() {
  try {
    const supabase = await createClient();
    const first = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("is_active", true)
      .order("name");
    const { data, error } =
      first.error && isMissingProductImagesRelation(first.error)
        ? await supabase
            .from("products")
            .select(PRODUCT_SELECT_CORE)
            .eq("is_active", true)
            .order("name")
        : first;
    if (error) throw error;
    const campaigns = await loadActiveCampaigns(supabase);
    return {
      success: true as const,
      data: applyLiveCampaignsToProducts(((data ?? []) as Product[]).map(hydrateProduct), campaigns),
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
    const campaigns = await loadActiveCampaigns(supabase);
    return {
      success: true as const,
      data: applyLiveCampaigns(hydrateProduct(data as Product), campaigns),
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productNotFound", err),
    };
  }
}

export async function getProductVariantsAction(productId: string) {
  try {
    const supabase = await createClient();
    const { data: current, error: currentError } = await supabase
      .from("products")
      .select("id, parent_product_id")
      .eq("id", productId)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) return { success: true as const, data: [] as ProductVariantOption[] };

    const anchorId = current.parent_product_id ?? current.id;
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, variant_label, price, compare_at_price, stock, currency")
      .or(`id.eq.${anchorId},parent_product_id.eq.${anchorId}`)
      .eq("is_active", true)
      .order("price", { ascending: true });
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as ProductVariantOption[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.productsLoadFailed", err),
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
      data: ((data ?? []) as Product[]).map(hydrateProduct),
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
  inventory_unit?: InventoryUnit;
  low_stock_threshold?: number;
  category_id?: string | null;
  brand_id?: string | null;
  image_url?: string | null;
  blur_hash?: string | null;
  is_active?: boolean;
  sku?: string | null;
  parent_product_id?: string | null;
  variant_label?: string | null;
  features?: ProductFeatureInput[];
  images?: ProductImageInput[];
}) {
  try {
    const { supabase } = await requireAdmin();
    const description_fa = input.description_fa?.trim() || input.description?.trim() || null;
    const description_ar = input.description_ar?.trim() || null;
    const description_en = input.description_en?.trim() || null;
    const cover = coverFromImages(input.images);
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
        currency: input.currency ?? DEFAULT_CURRENCY,
        stock: input.stock,
        inventory_unit: input.inventory_unit ?? "count",
        low_stock_threshold: Math.max(0, Math.floor(input.low_stock_threshold ?? 5)),
        category_id: input.category_id ?? null,
        brand_id: input.brand_id ?? null,
        image_url: cover.image_url ?? input.image_url ?? null,
        blur_hash: cover.blur_hash ?? input.blur_hash ?? null,
        is_active: input.is_active ?? true,
        sku: input.sku?.trim() || null,
        parent_product_id: input.parent_product_id ?? null,
        variant_label: input.variant_label?.trim() || null,
      })
      .select(PRODUCT_SELECT)
      .single();
    if (error) throw error;
    await syncProductFeatures(supabase, data.id, input.features);
    await syncProductImages(
      supabase,
      data.id,
      input.images ??
        (input.image_url
          ? [{ image_url: input.image_url, blur_hash: input.blur_hash }]
          : undefined),
    );
    const refreshed = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("id", data.id)
      .single();
    if (refreshed.error) throw refreshed.error;
    return { success: true as const, data: hydrateProduct(refreshed.data as Product) };
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
    inventory_unit: InventoryUnit;
    low_stock_threshold: number;
    category_id: string | null;
    brand_id: string | null;
    image_url: string | null;
    blur_hash: string | null;
    is_active: boolean;
    sku: string | null;
    parent_product_id: string | null;
    variant_label: string | null;
    features: ProductFeatureInput[];
    images: ProductImageInput[];
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    const { features, images, ...rest } = input;
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

    if (images !== undefined) {
      const cover = coverFromImages(images);
      patch.image_url = cover.image_url;
      patch.blur_hash = cover.blur_hash;
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
    }
    if (images !== undefined) {
      await syncProductImages(supabase, id, images);
    }

    if (features !== undefined || images !== undefined) {
      const refreshed = await supabase
        .from("products")
        .select(PRODUCT_SELECT)
        .eq("id", id)
        .single();
      if (refreshed.error) throw refreshed.error;
      return { success: true as const, data: hydrateProduct(refreshed.data as Product) };
    }

    return { success: true as const, data: hydrateProduct(data as Product) };
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
