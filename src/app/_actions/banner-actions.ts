"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { HeroBanner } from "@/app/_types/database.types";

export type HeroBannerText = {
  fa?: string | null;
  ar?: string | null;
  en?: string | null;
};

export type HeroBannerInput = {
  badge?: HeroBannerText;
  title?: HeroBannerText;
  subtitle?: HeroBannerText;
  cta_label?: HeroBannerText;
  cta_href?: string | null;
  image_url?: string | null;
  blur_hash?: string | null;
  image_url_ltr?: string | null;
  blur_hash_ltr?: string | null;
  sort_order?: number;
  is_active?: boolean;
};

function revalidateBannerPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard/banners");
}

function toPayload(input: HeroBannerInput) {
  const imageUrl = input.image_url?.trim() || null;
  const imageUrlLtr = input.image_url_ltr?.trim() || null;

  const text = (field: HeroBannerText | undefined) => {
    const fa = field?.fa?.trim() || null;
    const ar = field?.ar?.trim() || null;
    const en = field?.en?.trim() || null;
    // Legacy single-value column mirrors the first non-empty language.
    return { fa, ar, en, legacy: fa || ar || en };
  };

  const badge = text(input.badge);
  const title = text(input.title);
  const subtitle = text(input.subtitle);
  const ctaLabel = text(input.cta_label);

  return {
    badge: badge.legacy,
    title: title.legacy,
    subtitle: subtitle.legacy,
    cta_label: ctaLabel.legacy,
    badge_fa: badge.fa,
    badge_ar: badge.ar,
    badge_en: badge.en,
    title_fa: title.fa,
    title_ar: title.ar,
    title_en: title.en,
    subtitle_fa: subtitle.fa,
    subtitle_ar: subtitle.ar,
    subtitle_en: subtitle.en,
    cta_label_fa: ctaLabel.fa,
    cta_label_ar: ctaLabel.ar,
    cta_label_en: ctaLabel.en,
    cta_href: input.cta_href?.trim() || "/categories",
    image_url: imageUrl,
    blur_hash: imageUrl ? input.blur_hash?.trim() || null : null,
    image_url_ltr: imageUrlLtr,
    blur_hash_ltr: imageUrlLtr ? input.blur_hash_ltr?.trim() || null : null,
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
