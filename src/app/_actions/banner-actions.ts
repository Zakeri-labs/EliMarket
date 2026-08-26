"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { HeroBanner } from "@/app/_types/database.types";

export type HeroBannerInput = {
  badge?: string | null;
  title?: string | null;
  subtitle?: string | null;
  cta_label?: string | null;
  cta_href?: string | null;
  image_url?: string | null;
  blur_hash?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard/banners");
}

function toPayload(input: HeroBannerInput) {
  const imageUrl = input.image_url?.trim() || null;
  return {
    badge: input.badge?.trim() || null,
    title: input.title?.trim() || null,
    subtitle: input.subtitle?.trim() || null,
    cta_label: input.cta_label?.trim() || null,
    cta_href: input.cta_href?.trim() || "/categories",
    image_url: imageUrl,
    blur_hash: imageUrl ? input.blur_hash?.trim() || null : null,
    sort_order: input.sort_order ?? 0,
    is_active: input.is_active ?? true,
  };
}

export async function getHeroBannersAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .eq("is_active", true)
      .order("sort_order")
      .order("created_at");

    if (error) throw error;
    return {
      success: true as const,
      data: (data ?? []) as HeroBanner[],
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.bannersLoadFailed", err),
    };
  }
}

export async function getAdminHeroBannersAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("hero_banners")
      .select("*")
      .order("sort_order")
      .order("created_at");

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as HeroBanner[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.bannersLoadFailed", err),
    };
  }
}

export async function createHeroBannerAction(input: HeroBannerInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("hero_banners")
      .insert(toPayload(input))
      .select("*")
      .single();

    if (error) throw error;
    revalidateBannerPaths();
    return { success: true as const, data: data as HeroBanner };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.bannerCreateFailed", err),
    };
  }
}

export async function updateHeroBannerAction(id: string, input: HeroBannerInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("hero_banners")
      .update(toPayload(input))
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    revalidateBannerPaths();
    return { success: true as const, data: data as HeroBanner };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.bannerUpdateFailed", err),
    };
  }
}

export async function deleteHeroBannerAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("hero_banners").delete().eq("id", id);
    if (error) throw error;
    revalidateBannerPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.bannerDeleteFailed", err),
    };
  }
}
