"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { StoreSettings } from "@/app/_types/database.types";
import { generateBlurHashFromFile } from "@/lib/images/generate-blur-hash";
import { roundMoney } from "@/config/brand";
import { withDeadlockRetry } from "@/lib/supabase/retry-deadlock";
import type { SupabaseClient } from "@supabase/supabase-js";

const SETTINGS_ID = "default";

const DEFAULT_SETTINGS: StoreSettings = {
  id: SETTINGS_ID,
  show_prices: true,
  show_product_detail_extras: true,
  cash_surcharge: 0,
  updated_at: new Date().toISOString(),
  hero_badge: null,
  hero_title: null,
  hero_subtitle: null,
  hero_cta_label: null,
  hero_cta_href: "/categories",
  hero_image_url: null,
  hero_blur_hash: null,
  receipt_store_name_fa: null,
  receipt_store_name_ar: null,
  receipt_store_name_en: null,
  receipt_store_address_fa: null,
  receipt_store_address_ar: null,
  receipt_store_address_en: null,
  receipt_store_phone: null,
  receipt_footer_fa: null,
  receipt_footer_ar: null,
  receipt_footer_en: null,
};

async function updateStoreSettingsRow(
  supabase: SupabaseClient,
  patch: Record<string, unknown>,
): Promise<StoreSettings> {
  return withDeadlockRetry(async () => {
    const updated_at = new Date().toISOString();
    const { data, error } = await supabase
      .from("store_settings")
      .update({ ...patch, updated_at })
      .eq("id", SETTINGS_ID)
      .select("*")
      .maybeSingle();

    if (error) throw error;
    if (data) return { ...DEFAULT_SETTINGS, ...data } as StoreSettings;

    const { data: inserted, error: insertError } = await supabase
      .from("store_settings")
      .insert({
        id: SETTINGS_ID,
        show_prices: true,
        show_product_detail_extras: true,
        ...patch,
        updated_at,
      })
      .select("*")
      .single();

    if (insertError) throw insertError;
    return { ...DEFAULT_SETTINGS, ...inserted } as StoreSettings;
  });
}

export async function getStoreSettingsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (error) throw error;

    const settings: StoreSettings = data
      ? { ...DEFAULT_SETTINGS, ...data }
      : DEFAULT_SETTINGS;

    return { success: true as const, data: settings };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsLoadFailed", err),
      data: DEFAULT_SETTINGS,
    };
  }
}

export async function setShowPricesAction(showPrices: boolean) {
  try {
    const { supabase } = await requireAdmin();
    const data = await updateStoreSettingsRow(supabase, {
      show_prices: showPrices,
    });

    revalidatePath("/");
    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsUpdateFailed", err),
    };
  }
}

export async function toggleShowPricesAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("store_settings")
      .select("show_prices")
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (error) throw error;
    const next = !(data?.show_prices ?? true);
    return setShowPricesAction(next);
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.priceToggleFailed", err),
    };
  }
}

export async function setShowProductDetailExtrasAction(show: boolean) {
  try {
    const { supabase } = await requireAdmin();
    const data = await updateStoreSettingsRow(supabase, {
      show_product_detail_extras: show,
    });

    revalidatePath("/");
    revalidatePath("/products", "layout");
    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsUpdateFailed", err),
    };
  }
}

export async function setCashSurchargeAction(amount: number) {
  try {
    const { supabase } = await requireAdmin();
    const safe =
      Number.isFinite(amount) && amount > 0 ? roundMoney(amount) : 0;
    const data = await updateStoreSettingsRow(supabase, {
      cash_surcharge: safe,
    });

    revalidatePath("/");
    revalidatePath("/checkout");
    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsUpdateFailed", err),
    };
  }
}

export type HeroSettingsInput = {
  hero_badge?: string | null;
  hero_title?: string | null;
  hero_subtitle?: string | null;
  hero_cta_label?: string | null;
  hero_cta_href?: string | null;
  hero_image_url?: string | null;
  hero_blur_hash?: string | null;
};

export async function updateHeroSettingsAction(input: HeroSettingsInput) {
  try {
    const { supabase } = await requireAdmin();
    const data = await updateStoreSettingsRow(supabase, {
      hero_badge: input.hero_badge?.trim() || null,
      hero_title: input.hero_title?.trim() || null,
      hero_subtitle: input.hero_subtitle?.trim() || null,
      hero_cta_label: input.hero_cta_label?.trim() || null,
      hero_cta_href: input.hero_cta_href?.trim() || "/categories",
      hero_image_url: input.hero_image_url?.trim() || null,
      hero_blur_hash: input.hero_blur_hash?.trim() || null,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/banners");
    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.heroUpdateFailed", err),
    };
  }
}

export type ReceiptSettingsInput = {
  receipt_store_name_fa?: string | null;
  receipt_store_name_ar?: string | null;
  receipt_store_name_en?: string | null;
  receipt_store_address_fa?: string | null;
  receipt_store_address_ar?: string | null;
  receipt_store_address_en?: string | null;
  receipt_store_phone?: string | null;
  receipt_footer_fa?: string | null;
  receipt_footer_ar?: string | null;
  receipt_footer_en?: string | null;
};

export async function updateReceiptSettingsAction(input: ReceiptSettingsInput) {
  try {
    const { supabase } = await requireAdmin();
    const clean = (value?: string | null) => value?.trim() || null;
    const data = await updateStoreSettingsRow(supabase, {
      receipt_store_name_fa: clean(input.receipt_store_name_fa),
      receipt_store_name_ar: clean(input.receipt_store_name_ar),
      receipt_store_name_en: clean(input.receipt_store_name_en),
      receipt_store_address_fa: clean(input.receipt_store_address_fa),
      receipt_store_address_ar: clean(input.receipt_store_address_ar),
      receipt_store_address_en: clean(input.receipt_store_address_en),
      receipt_store_phone: clean(input.receipt_store_phone),
      receipt_footer_fa: clean(input.receipt_footer_fa),
      receipt_footer_ar: clean(input.receipt_footer_ar),
      receipt_footer_en: clean(input.receipt_footer_en),
    });

    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsUpdateFailed", err),
    };
  }
}

export async function uploadHeroBannerImageAction(formData: FormData) {
  try {
    const { supabase } = await requireAdmin();
    const file = formData.get("file") as File | null;
    if (!file) throw new Error(await serverT("errors.noFileSelected"));

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `hero/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
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
