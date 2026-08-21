"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { Category } from "@/app/_types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

function revalidateCategoryPaths() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/dashboard/categories");
}

async function assertValidParent(
  supabase: SupabaseClient,
  parentId: string | null | undefined,
  selfId?: string,
) {
  if (!parentId) return;
  if (selfId && parentId === selfId) {
    throw new Error(await serverT("errors.categoryParentInvalid"));
  }
  const { data, error } = await supabase.from("categories").select("id, parent_id");
  if (error) throw error;
  const rows = (data ?? []) as { id: string; parent_id: string | null }[];
  const byId = new Map(rows.map((row) => [row.id, row]));
  if (!byId.has(parentId)) {
    throw new Error(await serverT("errors.categoryParentInvalid"));
  }

  let current: string | null = parentId;
  const seen = new Set<string>();
  while (current) {
    if (selfId && current === selfId) {
      throw new Error(await serverT("errors.categoryParentInvalid"));
    }
    if (seen.has(current)) {
      throw new Error(await serverT("errors.categoryParentInvalid"));
    }
    seen.add(current);
    current = byId.get(current)?.parent_id ?? null;
  }
}

export async function createCategoryAction(input: {
  name: string;
  slug: string;
  sort_order?: number;
  parent_id?: string | null;
  image_url?: string | null;
  blur_hash?: string | null;
}) {
  try {
    const { supabase } = await requireAdmin();
    await assertValidParent(supabase, input.parent_id);
    const imageUrl = input.image_url?.trim() || null;
    const parentId = input.parent_id?.trim() || null;
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: input.name.trim(),
        name_fa: input.name.trim(),
        slug: input.slug.trim(),
        sort_order: input.sort_order ?? 0,
        image_url: imageUrl,
        blur_hash: imageUrl ? input.blur_hash?.trim() || null : null,
        ...(parentId ? { parent_id: parentId } : {}),
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
    parent_id: string | null;
    image_url: string | null;
    blur_hash: string | null;
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    if (input.parent_id !== undefined) {
      await assertValidParent(supabase, input.parent_id, id);
    }
    const payload: Record<string, string | number | null> = {};
    if (input.name !== undefined) {
      payload.name = input.name.trim();
      payload.name_fa = input.name.trim();
    }
    if (input.slug !== undefined) payload.slug = input.slug.trim();
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
    if (input.parent_id !== undefined) {
      payload.parent_id = input.parent_id || null;
    }
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
