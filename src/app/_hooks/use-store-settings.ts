"use client";

import { useQuery } from "@tanstack/react-query";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";

export function useStoreSettings() {
  const query = useQuery({
    queryKey: ["store-settings"],
    queryFn: async () => {
      const result = await getStoreSettingsAction();
      return result.data ?? { id: "default", show_prices: true, updated_at: "" };
    },
    staleTime: 15_000,
  });

  return {
    ...query,
    showPrices: query.data?.show_prices ?? true,
  };
}
