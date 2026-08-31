"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { DeliveryArea } from "@/app/_types/database.types";

type DeliveryAreaInput = {
  slug: string;
  name_fa: string;
  name_ar?: string | null;
  name_en?: string | null;
  serviceable: boolean;
  active: boolean;
  sort_order: number;
  center_lat?: number | null;
  center_lng?: number | null;
  radius_km?: number;
  delivery_fee?: number | null;
  min_order?: number | null;
  eta_minutes?: number | null;
};

function revalidateDeliveryAreaPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard/delivery-areas");
}

function normalize(input: Partial<DeliveryAreaInput>) {
  const payload: Record<string, string | number | boolean | null> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim();
  if (input.name_fa !== undefined) payload.name_fa = input.name_fa.trim();
  if (input.name_ar !== undefined) payload.name_ar = input.name_ar?.trim() || null;
  if (input.name_en !== undefined) payload.name_en = input.name_en?.trim() || null;
  if (input.serviceable !== undefined) payload.serviceable = input.serviceable;
  if (input.active !== undefined) payload.active = input.active;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.center_lat !== undefined) {
    payload.center_lat =
      input.center_lat === null || Number.isNaN(input.center_lat) ? null : input.center_lat;
  }
  if (input.center_lng !== undefined) {
    payload.center_lng =
      input.center_lng === null || Number.isNaN(input.center_lng) ? null : input.center_lng;
  }
  if (input.radius_km !== undefined && !Number.isNaN(input.radius_km) && input.radius_km > 0) {
    payload.radius_km = input.radius_km;
  }
  if (input.delivery_fee !== undefined) {
    payload.delivery_fee =
      input.delivery_fee === null || Number.isNaN(input.delivery_fee) ? null : input.delivery_fee;
  }
  if (input.min_order !== undefined) {
    payload.min_order =
      input.min_order === null || Number.isNaN(input.min_order) ? null : input.min_order;
  }
  if (input.eta_minutes !== undefined) {
    payload.eta_minutes =
      input.eta_minutes === null || Number.isNaN(input.eta_minutes) ? null : input.eta_minutes;
  }
  return payload;
}

/** Storefront: active areas only, ordered for the "Deliver to" control. */
export async function getDeliveryAreasAction() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("delivery_areas")
      .select("*")
      .eq("active", true)
      .order("sort_order");

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as DeliveryArea[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreasLoadFailed", err),
    };
  }
}

export async function getAdminDeliveryAreasAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("delivery_areas")
      .select("*")
      .order("sort_order");

    if (error) throw error;
    return { success: true as const, data: (data ?? []) as DeliveryArea[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreasLoadFailed", err),
    };
  }
}

export async function createDeliveryAreaAction(input: DeliveryAreaInput) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("delivery_areas")
      .insert(normalize(input))
      .select("*")
      .single();

    if (error) throw error;
    revalidateDeliveryAreaPaths();
    return { success: true as const, data: data as DeliveryArea };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreaCreateFailed", err),
    };
  }
}

export async function updateDeliveryAreaAction(id: string, input: Partial<DeliveryAreaInput>) {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("delivery_areas")
      .update(normalize(input))
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    revalidateDeliveryAreaPaths();
    return { success: true as const, data: data as DeliveryArea };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreaUpdateFailed", err),
    };
  }
}

export async function deleteDeliveryAreaAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("delivery_areas").delete().eq("id", id);
    if (error) throw error;
    revalidateDeliveryAreaPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreaDeleteFailed", err),
    };
  }
}
