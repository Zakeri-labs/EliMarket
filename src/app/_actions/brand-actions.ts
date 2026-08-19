"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { Brand } from "@/app/_types/database.types";

function revalidateBrandPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard/brands");
  revalidatePath("/dashboard/products");
}

export async function createBrandAction(input: {
  name: string;
  slug: string;
  logo_url?: string | null;
  sort_order?: number;
}) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("brands")
      .insert({
        name: input.name.trim(),
        slug: input.slug.trim(),
        logo_url: input.logo_url?.trim() || null,
        sort_order: input.sort_order ?? 0,
      })
      .select("*")
      .single();

    if (error) throw error;
    revalidateBrandPaths();
    return { success: true as const, data: data as Brand };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.brandCreateFailed", err),
    };
  }
}

export async function updateBrandAction(
  id: string,
  input: Partial<{
    name: string;
    slug: string;
    logo_url: string | null;
    sort_order: number;
  }>,
) {
  try {
    const { supabase } = await requireAdmin();
    const payload: Record<string, string | number | null> = {};
    if (input.name !== undefined) payload.name = input.name.trim();
    if (input.slug !== undefined) payload.slug = input.slug.trim();
    if (input.logo_url !== undefined) payload.logo_url = input.logo_url?.trim() || null;
    if (input.sort_order !== undefined) payload.sort_order = input.sort_order;

    const { data, error } = await supabase
      .from("brands")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    revalidateBrandPaths();
    return { success: true as const, data: data as Brand };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.brandUpdateFailed", err),
    };
  }
}

export async function deleteBrandAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("brands").delete().eq("id", id);
    if (error) throw error;
    revalidateBrandPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.brandDeleteFailed", err),
    };
  }
}

export async function getAdminBrandsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Brand[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.brandsLoadFailed", err),
    };
  }
}

export async function getBrandsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("brands")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Brand[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.brandsLoadFailed", err),
    };
  }
}
