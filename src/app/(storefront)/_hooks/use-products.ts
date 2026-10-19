"use client";

import { useSyncExternalStore } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/app/_actions/product-actions";

const noopSubscribe = () => () => {};

/** false on the server and during hydration, true afterwards (and on client navigations). */
function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

export function useProducts() {
  const query = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const result = await getProductsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  // The header (in the layout) also calls this hook and hydrates before the
  // page's loading.tsx Suspense boundary, so the cache can already hold data
  // when page components hydrate. The server always renders the pending
  // skeleton, so report pending until hydration finishes to match it.
  const hydrated = useHydrated();
  if (hydrated) return query;
  return { ...query, data: undefined, error: null, isPending: true as const };
}
