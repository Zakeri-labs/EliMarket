"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddressesAction } from "@/app/_actions/address-actions";

export function useAddresses() {
  return useQuery({
    queryKey: ["addresses"],
    queryFn: async () => {
      const result = await getAddressesAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
