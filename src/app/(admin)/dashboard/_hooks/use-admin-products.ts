"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminProductsAction } from "@/app/_actions/product-actions";

export function useAdminProducts() {
  return useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const result = await getAdminProductsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    // Poll while any product is still being generated in the background so
    // the "generating" badge clears on its own without a manual refresh.
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasPending = data?.some(
        (product) =>
          product.generation_status === "pending" || product.generation_status === "generating",
      );
      return hasPending ? 5_000 : false;
    },
  });
}
