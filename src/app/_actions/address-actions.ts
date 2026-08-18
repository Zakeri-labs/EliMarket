"use server";

import { requireAuth } from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { Address } from "@/app/_types/database.types";

export async function getAddressesAction() {
  try {
    const { supabase, user } = await requireAuth();
    const { data, error } = await supabase
      .from("addresses")
      .select("*")
      .eq("user_id", user.id)
      .order("is_default", { ascending: false });
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Address[] };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری آدرس‌ها ناموفق بود"),
    };
  }
}

export async function createAddressAction(input: {
  label: string;
  address_line: string;
  lat: number;
  lng: number;
  is_default?: boolean;
}) {
  try {
    const { supabase, user } = await requireAuth();

    if (input.is_default) {
      await supabase
        .from("addresses")
        .update({ is_default: false })
        .eq("user_id", user.id);
    }

    const { data, error } = await supabase
      .from("addresses")
      .insert({
        user_id: user.id,
        label: input.label,
        address_line: input.address_line,
        lat: input.lat,
        lng: input.lng,
        is_default: input.is_default ?? false,
      })
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Address };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "ثبت آدرس ناموفق بود"),
    };
  }
}
