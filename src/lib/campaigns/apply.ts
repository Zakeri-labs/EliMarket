import type { Campaign, Product, ProductCampaign } from "@/app/_types/database.types";

export function isCampaignLive(campaign: Campaign, now = Date.now()): boolean {
  if (!campaign.is_active) return false;
  const start = new Date(campaign.starts_at).getTime();
  const end = new Date(campaign.ends_at).getTime();
  return start <= now && now < end;
}

export function roundMoney(value: number): number {
  return Math.round(Math.max(0, value) * 1000) / 1000;
}

export function campaignCandidatePrice(
  listPrice: number,
  campaign: Campaign,
  salePrice?: number | null,
): number {
  if (salePrice != null && Number(salePrice) >= 0) {
    return roundMoney(Number(salePrice));
  }
  const list = Number(listPrice);
  const amount = Number(campaign.discount_value);
  if (campaign.type === "percent") {
    return roundMoney(list * (1 - amount / 100));
  }
  return roundMoney(list - amount);
}

function toProductCampaign(campaign: Campaign): ProductCampaign {
  return {
    id: campaign.id,
    name: campaign.name,
    slug: campaign.slug,
    type: campaign.type,
    discount_value: campaign.discount_value,
    starts_at: campaign.starts_at,
    ends_at: campaign.ends_at,
    show_on_home: campaign.show_on_home,
    badge: campaign.badge,
  };
}

export function applyLiveCampaigns(product: Product, campaigns: Campaign[], now = Date.now()): Product {
  const list = Number(product.price);
  let best = list;
  let applied: Campaign | null = null;

  for (const campaign of campaigns) {
    if (!isCampaignLive(campaign, now)) continue;
    const row = campaign.products?.find((item) => item.product_id === product.id);
    if (!row) continue;
    const candidate = campaignCandidatePrice(list, campaign, row.sale_price);
    if (candidate < best) {
      best = candidate;
      applied = campaign;
    }
  }

  if (!applied || best >= list) {
    return { ...product, campaign: product.campaign ?? null };
  }

  return {
    ...product,
    price: best,
    compare_at_price: list > best ? list : product.compare_at_price,
    campaign: toProductCampaign(applied),
  };
}

export function applyLiveCampaignsToProducts(products: Product[], campaigns: Campaign[]): Product[] {
  if (!campaigns.length) return products;
  return products.map((product) => applyLiveCampaigns(product, campaigns));
}
