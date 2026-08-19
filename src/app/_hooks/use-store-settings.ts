"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import type { StoreSettings } from "@/app/_types/database.types";

const FALLBACK_SETTINGS: StoreSettings = {
  id: "default",
  show_prices: true,
  updated_at: "",
  hero_badge: null,
  hero_title: null,
  hero_subtitle: null,
  hero_cta_label: null,
  hero_cta_href: "/categories",
  hero_image_url: null,
  hero_blur_hash: null,
};

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const result = await getStoreSettingsAction();
      return result.data ?? FALLBACK_SETTINGS;
    },
    staleTime: 15_000,
    placeholderData: FALLBACK_SETTINGS,
  });

  return {
    ...query,
    showPrices: query.data?.show_prices ?? true,
    hero: query.data ?? FALLBACK_SETTINGS,
  };
}
