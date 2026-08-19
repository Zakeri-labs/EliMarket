"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { Category } from "@/app/_types/database.types";

function revalidateCategoryPaths() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/dashboard/categories");
}

export async function createCategoryAction(input: {
  name: string;
  slug: string;
  sort_order?: number;
  image_url?: string | null;
  blur_hash?: string | null;
}) {
  try {
    const { supabase } = await requireAdmin();
    const imageUrl = input.image_url?.trim() || null;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: input.name.trim(),
        slug: input.slug.trim(),
        sort_order: input.sort_order ?? 0,
        image_url: imageUrl,
        blur_hash: imageUrl ? input.blur_hash?.trim() || null : null,
      })
      .select("*")
      .single();

    if (error) throw error;
    revalidateCategoryPaths();
    return { success: true as const, data: data as Category };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.categoryCreateFailed", err),
    };
  }
}

export async function updateCategoryAction(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    sort_order: number;
    image_url: string | null;
    blur_hash: string | null;
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    const payload: Record<string, string | number | null> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.slug !== undefined) payload.slug = input.slug.trim();
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
    if (input.image_url !== undefined) {
      const imageUrl = input.image_url?.trim() || null;
      payload.image_url = imageUrl;
      if (input.blur_hash !== undefined) {
        payload.blur_hash = imageUrl ? input.blur_hash?.trim() || null : null;
      } else if (!imageUrl) {
        payload.blur_hash = null;
      }
    } else if (input.blur_hash !== undefined) {
      payload.blur_hash = input.blur_hash?.trim() || null;
    }

    const { data, error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    revalidateCategoryPaths();
    return { success: true as const, data: data as Category };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.categoryUpdateFailed", err),
    };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("categories").delete().eq("id", id);
    if (error) throw error;
    revalidateCategoryPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.categoryDeleteFailed", err),
    };
  }
}

export async function getAdminCategoriesAction() {
  try {
    const { supabase } = await requireAdmin();
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
