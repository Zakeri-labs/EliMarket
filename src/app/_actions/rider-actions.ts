"use server";

import { revalidatePath } from "next/cache";
import { requireAuth, requireRole } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { DELIVERY_FEE } from "@/config/brand";
import type { FailedDeliveryReason, Order } from "@/app/_types/database.types";

const FAILED_DELIVERY_REASONS: FailedDeliveryReason[] = [
  "customer_absent",
  "no_answer",
  "wrong_address",
  "customer_refused",
  "other",
];

const PROOF_PATH_PREFIX = "delivery/";

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
      .update({
        rider_id: user.id,
        status: "out_for_delivery",
        picked_up_at: null,
      })
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

/** Step 1: rider confirms they collected the order from the store. */
export async function riderMarkPickedUpAction(orderId: string) {
  try {
    const { user } = await requireRole("rider");
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({ picked_up_at: new Date().toISOString() })
      .eq("id", orderId)
      .eq("rider_id", user.id)
      .eq("status", "out_for_delivery")
      .is("picked_up_at", null)
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

/** Step 2: successful hand-off. `photoPath` is a required proof photo already
 *  uploaded to the private `delivery-proofs` bucket by the client. */
export async function riderMarkDeliveredAction(
  orderId: string,
  photoPath: string,
) {
  try {
    const { user } = await requireRole("rider");
    if (!photoPath || !photoPath.startsWith(PROOF_PATH_PREFIX)) {
      throw new Error(await serverT("errors.statusUpdateFailed"));
    }
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({ status: "delivered", delivered_photo_path: photoPath })
      .eq("id", orderId)
      .eq("rider_id", user.id)
      .eq("status", "out_for_delivery")
      .not("picked_up_at", "is", null)
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

/** Step 3: failed delivery. Records the reason (+ note when "other") and a
 *  required photo, then returns the order to the ready pool. */
export async function riderMarkUndeliveredAction(
  orderId: string,
  input: { reason: FailedDeliveryReason; note?: string; photoPath: string },
) {
  try {
    const { user } = await requireRole("rider");
    const note = input.note?.trim() || null;
    if (!FAILED_DELIVERY_REASONS.includes(input.reason)) {
      throw new Error(await serverT("errors.statusUpdateFailed"));
    }
    if (input.reason === "other" && !note) {
      throw new Error(await serverT("errors.statusUpdateFailed"));
    }
    if (!input.photoPath || !input.photoPath.startsWith(PROOF_PATH_PREFIX)) {
      throw new Error(await serverT("errors.statusUpdateFailed"));
    }
    const admin = createServiceRoleClient();

    const { data, error } = await admin
      .from("orders")
      .update({
        status: "preparing",
        rider_id: null,
        picked_up_at: null,
        failed_delivery_reason: input.reason,
        failed_delivery_note: note,
        failed_delivery_photo_path: input.photoPath,
        failed_delivery_at: new Date().toISOString(),
      })
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

/** Signed URL for a proof photo. Visible to an admin, the order's rider, or
 *  the customer who placed it. */
export async function getDeliveryProofUrlAction(
  orderId: string,
  kind: "delivered" | "failed",
) {
  try {
    const { user, profile } = await requireAuth();
    const admin = createServiceRoleClient();

    const { data: order, error } = await admin
      .from("orders")
      .select(
        "user_id, rider_id, delivered_photo_path, failed_delivery_photo_path",
      )
      .eq("id", orderId)
      .maybeSingle();
    if (error) throw error;
    if (!order) throw new Error(await serverT("errors.ordersLoadFailed"));

    const allowed =
      profile?.role === "admin" ||
      order.user_id === user.id ||
      order.rider_id === user.id;
    if (!allowed) throw new Error(await serverT("errors.operationFailed"));

    const path =
      kind === "delivered"
        ? order.delivered_photo_path
        : order.failed_delivery_photo_path;
    if (!path) throw new Error(await serverT("errors.ordersLoadFailed"));

    const { data: signed, error: signErr } = await admin.storage
      .from("delivery-proofs")
      .createSignedUrl(path, 120);
    if (signErr) throw signErr;

    return { success: true as const, data: { url: signed.signedUrl } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ordersLoadFailed", err),
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
