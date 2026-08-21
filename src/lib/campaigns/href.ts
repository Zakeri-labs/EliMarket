export function campaignSearchPath(campaign: { id: string; slug?: string | null }) {
  const value = campaign.slug?.trim() || campaign.id;
  return `/search?campaign=${encodeURIComponent(value)}`;
}
