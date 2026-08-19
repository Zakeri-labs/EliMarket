"use server";

import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { StoreSettings } from "@/app/_types/database.types";

const SETTINGS_ID = "default";

export async function getStoreSettingsAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("store_settings")
      .select("*")
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (error) throw error;

    const settings: StoreSettings = data ?? {
      id: SETTINGS_ID,
      show_prices: true,
      updated_at: new Date().toISOString(),
    };

    return { success: true as const, data: settings };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری تنظیمات ناموفق بود"),
      data: { id: SETTINGS_ID, show_prices: true, updated_at: new Date().toISOString() } as StoreSettings,
    };
  }
}

export async function setShowPricesAction(showPrices: boolean) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("store_settings")
      .upsert({
        id: SETTINGS_ID,
        show_prices: showPrices,
        updated_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (error) throw error;
    return { success: true as const, data: data as StoreSettings };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "به‌روزرسانی تنظیمات ناموفق بود"),
    };
  }
}

export async function toggleShowPricesAction() {
  try {
    const current = await getStoreSettingsAction();
    const next = !(current.data?.show_prices ?? true);
    return setShowPricesAction(next);
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "تغییر وضعیت قیمت ناموفق بود"),
    };
  }
}
