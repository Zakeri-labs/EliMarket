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

/**
 * Turn a map pin into a human-readable street address via OpenStreetMap (Nominatim).
 * One lookup per user map click — well within Nominatim's usage policy.
 * The caller drops the result into an editable text field, so an empty string
 * (no match) simply leaves the user to type the address themselves.
 */
export async function reverseGeocodeAction(
  lat: number,
  lng: number,
  lang?: string,
) {
  try {
    await requireAuth();

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return { success: true as const, data: "" };
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(lat));
    url.searchParams.set("lon", String(lng));
    url.searchParams.set("zoom", "18");
    url.searchParams.set("addressdetails", "1");

    const acceptLanguage =
      lang === "fa" ? "fa" : lang === "ar" ? "ar" : "en";

    const res = await fetch(url, {
      headers: {
        "User-Agent": "EliMarket-Storefront/1.0 (address map picker)",
        "Accept-Language": acceptLanguage,
      },
      // Same pin resolves to the same address; let the platform cache for a day.
      next: { revalidate: 86400 },
    });
    if (!res.ok) throw new Error(`Nominatim ${res.status}`);

    const body = (await res.json()) as {
      display_name?: string;
      address?: Record<string, string>;
    };

    const a = body.address ?? {};
    // Build a compact line from the most specific parts, skipping the country
    // and postcode noise that Nominatim's display_name tacks on.
    const parts = [
      [a.road, a.house_number].filter(Boolean).join(" "),
      a.neighbourhood ?? a.suburb ?? a.quarter,
      a.city ?? a.town ?? a.village ?? a.municipality,
      a.state ?? a.province,
    ].filter((p): p is string => Boolean(p && p.trim()));

    const sep = acceptLanguage === "en" ? ", " : "، ";
    const line = parts.length > 0 ? parts.join(sep) : body.display_name ?? "";
    return { success: true as const, data: line };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.coverageCheckFailed", err),
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
