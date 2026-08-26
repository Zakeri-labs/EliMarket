"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/core/supabase/server";
import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { slugifyProductName } from "@/lib/products/slug";
import {
  isMissingCampaignsRelation,
  loadActiveCampaigns,
  toLiveCampaignOptions,
} from "@/lib/campaigns/load";
import type { Campaign, CampaignType } from "@/app/_types/database.types";

export type CampaignInput = {
  name: string;
  slug?: string;
  type: CampaignType;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active?: boolean;
  show_on_home?: boolean;
  badge?: string | null;
  banner_image_url?: string | null;
  banner_blur_hash?: string | null;
  product_ids: string[];
};

function revalidateCampaignPaths() {
  revalidatePath("/");
  revalidatePath("/categories");
  revalidatePath("/search");
  revalidatePath("/dashboard/campaigns");
  revalidatePath("/dashboard/products");
}

function toCampaignPayload(input: CampaignInput) {
  const name = input.name.trim();
  const startsAt = new Date(input.starts_at);
  const endsAt = new Date(input.ends_at);
  if (!name) throw new Error("NAME_REQUIRED");
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    throw new Error("DATES_REQUIRED");
  }
  if (endsAt.getTime() <= startsAt.getTime()) throw new Error("WINDOW_INVALID");
  const discount = input.type === "percent" ? Math.round(Number(input.discount_value)) : Number(input.discount_value);
  if (!Number.isFinite(discount) || discount <= 0) throw new Error("DISCOUNT_REQUIRED");
  if (input.type === "percent" && discount > 90) throw new Error("PERCENT_MAX");
  const productIds = [...new Set(input.product_ids.filter(Boolean))];
  if (productIds.length === 0) throw new Error("PRODUCTS_REQUIRED");

  return {
    row: {
      name,
      slug: slugifyProductName(input.slug?.trim() || name),
      type: input.type,
      discount_value: discount,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      is_active: input.is_active ?? true,
      show_on_home: input.show_on_home ?? true,
      badge: input.badge?.trim() || null,
      banner_image_url: input.banner_image_url?.trim() || null,
      banner_blur_hash: input.banner_image_url?.trim()
        ? input.banner_blur_hash?.trim() || null
        : null,
    },
    productIds,
  };
}

async function campaignActionError(fallbackKey: string, err: unknown) {
  const code = err instanceof Error ? err.message : "";
  const mapped: Record<string, string> = {
    NAME_REQUIRED: "errors.campaignNameRequired",
    DATES_REQUIRED: "errors.campaignDatesRequired",
    WINDOW_INVALID: "errors.campaignWindowInvalid",
    DISCOUNT_REQUIRED: "errors.campaignDiscountRequired",
    PERCENT_MAX: "errors.campaignPercentMax",
    PRODUCTS_REQUIRED: "errors.campaignProductsRequired",
  };
  if (mapped[code]) return { success: false as const, error: await serverT(mapped[code]) };
  return {
    success: false as const,
    error: await actionErrorMessage(fallbackKey, err),
  };
}

export async function getAdminCampaignsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("campaigns")
      .select("*, products:campaign_products(*)")
      .order("starts_at", { ascending: false });
    if (error) {
      if (isMissingCampaignsRelation(error)) return { success: true as const, data: [] as Campaign[] };
      throw error;
    }
    return { success: true as const, data: (data ?? []) as Campaign[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.campaignsLoadFailed", err),
    };
  }
}

export async function getLiveCampaignsAction() {
  try {
    const supabase = await createClient();
    const campaigns = await loadActiveCampaigns(supabase);
    return { success: true as const, data: toLiveCampaignOptions(campaigns) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.campaignsLoadFailed", err),
    };
  }
}

async function syncCampaignProducts(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  campaignId: string,
  productIds: string[],
) {
  const { error: deleteError } = await supabase
    .from("campaign_products")
    .delete()
    .eq("campaign_id", campaignId);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from("campaign_products").insert(
    productIds.map((productId) => ({
      campaign_id: campaignId,
      product_id: productId,
      sale_price: null,
    })),
  );
  if (insertError) throw insertError;
}

export async function createCampaignAction(input: CampaignInput) {
  try {
    const { supabase } = await requireAdmin();
    const { row, productIds } = toCampaignPayload(input);
    const { data, error } = await supabase.from("campaigns").insert(row).select("*").single();
    if (error) throw error;
    await syncCampaignProducts(supabase, data.id, productIds);
    revalidateCampaignPaths();
    return { success: true as const, data: data as Campaign };
  } catch (err) {
    return campaignActionError("errors.campaignCreateFailed", err);
  }
}

export async function updateCampaignAction(id: string, input: CampaignInput) {
  try {
    const { supabase } = await requireAdmin();
    const { row, productIds } = toCampaignPayload(input);
    const { data, error } = await supabase
      .from("campaigns")
      .update(row)
      .eq("id", id)
      .select("*")
      .single();
    if (error) throw error;
    await syncCampaignProducts(supabase, id, productIds);
    revalidateCampaignPaths();
    return { success: true as const, data: data as Campaign };
  } catch (err) {
    return campaignActionError("errors.campaignUpdateFailed", err);
  }
}

export async function deleteCampaignAction(id: string) {
  try {
    const { supabase } = await requireAdmin();
    const { error } = await supabase.from("campaigns").delete().eq("id", id);
    if (error) throw error;
    revalidateCampaignPaths();
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.campaignDeleteFailed", err),
    };
  }
}
