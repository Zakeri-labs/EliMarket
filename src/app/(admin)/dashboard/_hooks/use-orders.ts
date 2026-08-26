"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrdersAction } from "@/app/_actions/order-actions";
import { createClient } from "@/core/supabase/client";

export function useOrders() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const result = await getOrdersAction();
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    },
  });

  useEffect(() => {
    const supabase = createClient();
    // Unique topic per mount — a shared name + React Strict Mode remount
    // would reuse an already-subscribed channel and throw on .on().
    const channel = supabase
      .channel(`orders-live-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return query;
}
