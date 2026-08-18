"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductsAction } from "@/app/_actions/product-actions";

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const result = await getProductsAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
