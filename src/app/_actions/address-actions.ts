"use server";

import { requireAuth } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
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
      error: await actionErrorMessage("errors.addressesLoadFailed", err),
    };
  }
}

async function unsetOtherDefaults(
  supabase: Awaited<ReturnType<typeof requireAuth>>["supabase"],
  userId: string,
) {
  await supabase
    .from("addresses")
    .update({ is_default: false })
    .eq("user_id", userId);
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
      await unsetOtherDefaults(supabase, user.id);
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
      error: await actionErrorMessage("errors.addressSaveFailed", err),
    };
  }
}

export async function updateAddressAction(
  id: string,
  input: {
    label: string;
    address_line: string;
    lat: number;
    lng: number;
    is_default?: boolean;
  },
) {
  try {
    const { supabase, user } = await requireAuth();
    if (input.is_default) {
      await unsetOtherDefaults(supabase, user.id);
    }
    const { data, error } = await supabase
      .from("addresses")
      .update({
        label: input.label,
        address_line: input.address_line,
        lat: input.lat,
        lng: input.lng,
        is_default: input.is_default ?? false,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Address };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.addressUpdateFailed", err),
    };
  }
}

export async function deleteAddressAction(id: string) {
  try {
    const { supabase, user } = await requireAuth();
    const { error } = await supabase
      .from("addresses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.addressDeleteFailed", err),
    };
  }
}

export async function checkAddressCoverageAction(lat: number, lng: number) {
  try {
    const { supabase } = await requireAuth();
    const { data, error } = await supabase.rpc("address_in_coverage", {
      p_lat: lat,
      p_lng: lng,
    });
    if (error) throw error;
    return { success: true as const, data: Boolean(data) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.coverageCheckFailed", err),
    };
  }
}
