"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { AreaBoundary, DeliveryArea } from "@/app/_types/database.types";

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
  boundary?: AreaBoundary | null;
  delivery_fee?: number | null;
  min_order?: number | null;
  eta_minutes?: number | null;
};

function revalidateDeliveryAreaPaths() {
  revalidatePath("/");
  revalidatePath("/dashboard/delivery-areas");
}

function num(value: number | null | undefined) {
  return value === null || value === undefined || Number.isNaN(value) ? null : value;
}

function normalize(input: Partial<DeliveryAreaInput>) {
  const payload: Record<string, unknown> = {};
  if (input.slug !== undefined) payload.slug = input.slug.trim();
  if (input.name_fa !== undefined) payload.name_fa = input.name_fa.trim();
  if (input.name_ar !== undefined) payload.name_ar = input.name_ar?.trim() || null;
  if (input.name_en !== undefined) payload.name_en = input.name_en?.trim() || null;
  if (input.serviceable !== undefined) payload.serviceable = input.serviceable;
  if (input.active !== undefined) payload.active = input.active;
  if (input.sort_order !== undefined) payload.sort_order = input.sort_order;
  if (input.center_lat !== undefined) payload.center_lat = num(input.center_lat);
  if (input.center_lng !== undefined) payload.center_lng = num(input.center_lng);
  if (input.radius_km !== undefined && !Number.isNaN(input.radius_km) && (input.radius_km ?? 0) > 0) {
    payload.radius_km = input.radius_km;
  }
  if (input.boundary !== undefined) payload.boundary = input.boundary ?? null;
  if (input.delivery_fee !== undefined) payload.delivery_fee = num(input.delivery_fee);
  if (input.min_order !== undefined) payload.min_order = num(input.min_order);
  if (input.eta_minutes !== undefined) payload.eta_minutes = num(input.eta_minutes);
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

type BoundaryLookup = {
  boundary: AreaBoundary | null;
  center: { lat: number; lng: number } | null;
  displayName: string;
};

/**
 * Look up a real administrative boundary for a place name via OpenStreetMap (Nominatim).
 * Admin-only, one place at a time — Nominatim's usage policy allows this low volume.
 * Returns the polygon when OSM has one; the caller falls back to manual drawing otherwise.
 */
export async function fetchAreaBoundaryAction(query: string) {
  try {
    await requireAdmin();
    const q = query.trim();
    if (!q) {
      return { success: true as const, data: { boundary: null, center: null, displayName: "" } };
    }

    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", `${q}, Oman`);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("polygon_geojson", "1");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "om");

    const res = await fetch(url, {
      headers: {
        "User-Agent": "EliMarket-Admin/1.0 (delivery-area boundary lookup)",
        "Accept-Language": "en",
      },
      // Boundaries change rarely; let the platform cache the response for a day.
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const rows = (await res.json()) as Array<{
      lat?: string;
      lon?: string;
      display_name?: string;
      geojson?: { type?: string; coordinates?: unknown };
    }>;
    const hit = rows[0];

    const geo = hit?.geojson;
    const boundary: AreaBoundary | null =
      geo && (geo.type === "Polygon" || geo.type === "MultiPolygon")
        ? (geo as AreaBoundary)
        : null;
    const center =
      hit?.lat && hit?.lon ? { lat: Number(hit.lat), lng: Number(hit.lon) } : null;

    return {
      success: true as const,
      data: { boundary, center, displayName: hit?.display_name ?? "" } satisfies BoundaryLookup,
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.deliveryAreaBoundaryFailed", err),
    };
  }
}
