"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { DELIVERY_FEE } from "@/config/brand";
import type { Order } from "@/app/_types/database.types";

const ORDER_SELECT =
  "*, order_items(*, product:products(*)), address:addresses(*)";

export async function getReadyOrdersAction() {
  try {
    const { supabase } = await requireRole("rider");
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("status", "preparing")
      .is("rider_id", null)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Order[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ordersLoadFailed", err),
    };
  }
}

/** Orders assigned to this rider (active + history). */
export async function getMyRiderOrdersAction() {
  try {
    const { supabase, user } = await requireRole("rider");
    const { data, error } = await supabase
      .from("orders")
      .select(ORDER_SELECT)
      .eq("rider_id", user.id)
      .in("status", ["out_for_delivery", "delivered"])
      .order("created_at", { ascending: false })
      .limit(80);
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as Order[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ordersLoadFailed", err),
    };
  }
}

export async function acceptOrderAction(orderId: string) {
  try {
    const { user } = await requireRole("rider");
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({ rider_id: user.id, status: "out_for_delivery" })
      .eq("id", orderId)
      .eq("status", "preparing")
      .is("rider_id", null)
      .select(ORDER_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.orderAcceptFailed"));
    revalidatePath("/rider");
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.orderAcceptFailed", err),
    };
  }
}

export async function riderMarkDeliveredAction(orderId: string) {
  try {
    const { user } = await requireRole("rider");
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({ status: "delivered" })
      .eq("id", orderId)
      .eq("rider_id", user.id)
      .eq("status", "out_for_delivery")
      .select(ORDER_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.statusUpdateFailed"));
    revalidatePath("/rider");
    revalidatePath("/rider/finance");
    revalidatePath("/dashboard/orders");
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.statusUpdateFailed", err),
    };
  }
}

export async function riderMarkUndeliveredAction(orderId: string) {
  try {
    const { user } = await requireRole("rider");
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({ status: "preparing", rider_id: null })
      .eq("id", orderId)
      .eq("rider_id", user.id)
      .eq("status", "out_for_delivery")
      .select(ORDER_SELECT)
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.statusUpdateFailed"));
    revalidatePath("/rider");
    revalidatePath("/dashboard/orders");
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.statusUpdateFailed", err),
    };
  }
}

export type RiderFinanceSummary = {
  deliveredCount: number;
  totalSales: number;
  deliveryFees: number;
  cashCollected: number;
  currency: string;
};

export async function getRiderFinanceAction() {
  try {
    const { supabase, user } = await requireRole("rider");
    const { data, error } = await supabase
      .from("orders")
      .select("total, currency, payment_method")
      .eq("rider_id", user.id)
      .eq("status", "delivered");
    if (error) throw error;

    const rows = data ?? [];
    const summary: RiderFinanceSummary = {
      deliveredCount: rows.length,
      totalSales: rows.reduce((sum, row) => sum + Number(row.total), 0),
      deliveryFees: rows.length * DELIVERY_FEE,
      cashCollected: rows
        .filter((row) => row.payment_method === "cash")
        .reduce((sum, row) => sum + Number(row.total), 0),
      currency: rows[0]?.currency ?? "OMR",
    };

    return { success: true as const, data: summary };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.financeLoadFailed", err),
    };
  }
}
