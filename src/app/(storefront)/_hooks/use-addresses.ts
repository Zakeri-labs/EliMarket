"use client";

import { useQuery } from "@tanstack/react-query";
import { getAddressesAction } from "@/app/_actions/address-actions";
import { useAuthStore } from "@/app/_store/auth-store";

export function useAddresses() {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.session?.id);
  const enabled = status === "authenticated" && Boolean(userId);

  return useQuery({
    queryKey: ["addresses", userId],
    enabled,
    queryFn: async () => {
      const result = await getAddressesAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });
}
