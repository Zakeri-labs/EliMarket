"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { Store } from "@/app/_types/database.types";

export async function getStoreAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("stores")
      .select("id, name, created_at, coverage_area")
      .limit(1)
      .maybeSingle();
    if (error) throw error;

    let coverage_area: unknown = null;
    if (data?.coverage_area) {
      const { data: geo } = await supabase.rpc("get_store_coverage_geojson", {
        p_store_id: data.id,
      });
      coverage_area = geo;
    }

    return {
      success: true as const,
      data: data
        ? ({ ...data, coverage_area } as Store)
        : null,
    };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "بارگذاری فروشگاه ناموفق بود"),
    };
  }
}

export async function updateStoreCoverageAction(input: {
  storeId?: string;
  name: string;
  coverageGeoJson: {
    type: "Polygon";
    coordinates: number[][][];
  };
}) {
  try {
    const { supabase } = await requireAdmin();
    const geojson = JSON.stringify(input.coverageGeoJson);

    const { data, error } = await supabase.rpc("upsert_store_coverage", {
      p_store_id: input.storeId ?? null,
      p_name: input.name,
      p_geojson: geojson,
    });
    if (error) throw error;
    return { success: true as const, data: data as Store };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "ذخیره محدوده پوشش ناموفق بود"),
    };
  }
}
