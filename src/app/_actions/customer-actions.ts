"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";

export type AdminCustomer = {
  id: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  orderCount: number;
  spent: number;
};

export async function getAdminCustomersAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at")
      .eq("role", "customer")
      .order("created_at", { ascending: false });
    if (profilesError) throw profilesError;

    const { data: orders, error: ordersError } = await supabase
      .from("orders")
      .select("user_id, total, status");
    if (ordersError) throw ordersError;

    const stats = new Map<string, { orderCount: number; spent: number }>();
    for (const order of orders ?? []) {
      const entry = stats.get(order.user_id) ?? { orderCount: 0, spent: 0 };
      entry.orderCount += 1;
      if (order.status === "delivered") {
        entry.spent += Number(order.total);
      }
      stats.set(order.user_id, entry);
    }

    const data: AdminCustomer[] = (profiles ?? []).map((profile) => {
      const entry = stats.get(profile.id);
      return {
        id: profile.id,
        full_name: profile.full_name,
        phone: profile.phone,
        created_at: profile.created_at,
        orderCount: entry?.orderCount ?? 0,
        spent: entry?.spent ?? 0,
      };
    });

    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.customersLoadFailed", err),
    };
  }
}
