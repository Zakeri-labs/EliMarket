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
  });
}
