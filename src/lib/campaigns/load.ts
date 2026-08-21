import type { SupabaseClient } from "@supabase/supabase-js";
import type { Campaign } from "@/app/_types/database.types";

export type CampaignBanner = Pick<
  Campaign,
  | "id"
  | "name"
  | "slug"
  | "type"
  | "discount_value"
  | "badge"
  | "banner_image_url"
  | "banner_blur_hash"
>;

export type LiveCampaignOption = {
  id: string;
  name: string;
  slug: string;
  product_ids: string[];
};

export function isMissingCampaignsRelation(error: {
  message?: string;
  details?: string;
  hint?: string;
}) {
  const text = `${error.message ?? ""} ${error.details ?? ""} ${error.hint ?? ""}`.toLowerCase();
  return (
    text.includes("campaigns") ||
    text.includes("campaign_products") ||
    text.includes("banner_image_url") ||
    text.includes("banner_blur_hash")
  );
}

export async function loadActiveCampaigns(supabase: SupabaseClient): Promise<Campaign[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("campaigns")
    .select("*, products:campaign_products(*)")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .order("ends_at");

  if (error) {
    if (isMissingCampaignsRelation(error)) return [];
    throw error;
  }

  return (data ?? []) as Campaign[];
}

export function toLiveCampaignOptions(campaigns: Campaign[]): LiveCampaignOption[] {
  return campaigns.map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    product_ids: (campaign.products ?? []).map((row) => row.product_id),
  }));
}

export async function loadLiveCampaignBanners(
  supabase: SupabaseClient,
): Promise<CampaignBanner[]> {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("campaigns")
    .select("id, name, slug, type, discount_value, badge, banner_image_url, banner_blur_hash")
    .eq("is_active", true)
    .lte("starts_at", now)
    .gte("ends_at", now)
    .not("banner_image_url", "is", null)
    .order("ends_at");

  if (error) {
    if (isMissingCampaignsRelation(error)) return [];
    throw error;
  }

  return ((data ?? []) as CampaignBanner[]).filter((row) => Boolean(row.banner_image_url?.trim()));
}
