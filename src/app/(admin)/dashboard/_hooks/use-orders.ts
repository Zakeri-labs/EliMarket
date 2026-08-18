"use client";

import { useQuery } from "@tanstack/react-query";
import { getOrdersAction } from "@/app/_actions/order-actions";

export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const result = await getOrdersAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
