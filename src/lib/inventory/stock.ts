import type { SupabaseClient } from "@supabase/supabase-js";
import type { Order } from "@/app/_types/database.types";

export async function applyOrderStockDecrement(
  supabase: SupabaseClient,
  orderId: string,
) {
  const { error } = await supabase.rpc("apply_order_stock_decrement", {
    p_order_id: orderId,
  });
  if (error) throw error;
}

export async function restoreOrderStock(
  supabase: SupabaseClient,
  order: Pick<Order, "id">,
) {
  const { error } = await supabase.rpc("restore_order_stock", {
    p_order_id: order.id,
  });
  if (error) throw error;
}
