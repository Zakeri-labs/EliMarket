"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin, requireAuth } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import { createPaymentForOrder } from "@/app/_actions/payment-actions";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { DEFAULT_CURRENCY, cartTotals, roundMoney } from "@/config/brand";
import { applyOrderStockDecrement, restoreOrderStock } from "@/lib/inventory/stock";
import { applyLiveCampaigns } from "@/lib/campaigns/apply";
import { loadActiveCampaigns } from "@/lib/campaigns/load";
import type {
  CreateOrderResult,
  Order,
  PaymentMethod,
  Product,
} from "@/app/_types/database.types";

/** Ensures admin inbox rows exist even if DB trigger/migration is missing. */
async function notifyAdminsOfNewOrder(order: Order) {
  try {
    const admin = createServiceRoleClient();
    const shortId = order.id.replace(/-/g, "").slice(0, 8).toUpperCase();
    const { data: admins, error: adminsError } = await admin
      .from("profiles")
      .select("id")
      .eq("role", "admin");
    if (adminsError || !admins?.length) return;

    const { data: existing } = await admin
      .from("admin_notifications")
      .select("recipient_id")
      .eq("order_id", order.id)
      .eq("type", "new_order");
    const already = new Set((existing ?? []).map((row) => row.recipient_id));

    const rows = admins
      .filter((a) => !already.has(a.id))
      .map((a) => ({
        recipient_id: a.id,
        type: "new_order",
        title: `New order #${shortId}`,
        body: `A new order was placed. Total: ${order.total} ${order.currency ?? "OMR"}`,
        order_id: order.id,
      }));

    if (!rows.length) return;
    await admin.from("admin_notifications").insert(rows);
  } catch {
    /* never fail checkout because of notifications */
  }
}

export async function getOrdersAction() {
  try {
    const { supabase, user, profile } = await requireAuth();
    let query = supabase
      .from("orders")
      .select("*, order_items(*, product:products(*)), address:addresses(*)")
      .order("created_at", { ascending: false });

    if (profile?.role !== "admin") {
      query = query.eq("user_id", user.id);
    }

    const { data, error } = await query;
    if (error) throw error;
    const orders = (data ?? []) as Order[];

    if (profile?.role === "admin" && orders.length) {
      const userIds = [...new Set(orders.map((order) => order.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds);
      const profileMap = new Map((profiles ?? []).map((item) => [item.id, item]));
      for (const order of orders) {
        order.customer = profileMap.get(order.user_id) ?? null;
      }
    }

    return { success: true as const, data: orders };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ordersLoadFailed", err),
    };
  }
}

export async function getOrderByIdAction(id: string) {
  try {
    const { supabase, user, profile } = await requireAuth();
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*, product:products(*)), address:addresses(*)")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.orderNotFound"));
    if (profile?.role !== "admin" && data.user_id !== user.id) {
      throw new Error(await serverT("errors.accessDenied"));
    }
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.orderNotFound", err),
    };
  }
}

export async function createOrderAction(payload: {
  items: Array<{ productId: string; quantity: number }>;
  addressId: string;
  deliverySlot: string;
  paymentMethod: PaymentMethod;
}): Promise<
  | { success: true; data: CreateOrderResult }
  | { success: false; error: string }
> {
  try {
    const { supabase, user } = await requireAuth();

    const settingsResult = await getStoreSettingsAction();
    if (!settingsResult.data?.show_prices) {
      throw new Error(await serverT("errors.cartDisabled"));
    }

    if (!payload.items.length) throw new Error(await serverT("errors.emptyCart"));

    const { data: address, error: addressError } = await supabase
      .from("addresses")
      .select("*")
      .eq("id", payload.addressId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (addressError) throw addressError;
    if (!address) throw new Error(await serverT("errors.addressSaveFailed"));

    const { data: inCoverage, error: coverageError } = await supabase.rpc(
      "address_in_coverage",
      { p_lat: address.lat, p_lng: address.lng },
    );
    if (coverageError) throw coverageError;
    if (inCoverage === false) {
      throw new Error(await serverT("errors.outsideCoverage"));
    }

    const productIds = payload.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price, compare_at_price, currency, stock, is_active")
      .in("id", productIds);
    if (productsError) throw productsError;

    const campaigns = await loadActiveCampaigns(supabase);
    const productMap = new Map(
      (products ?? []).map((p) => [p.id, applyLiveCampaigns(p as Product, campaigns)]),
    );
    let subtotal = 0;
    let currency = DEFAULT_CURRENCY;

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product?.is_active) throw new Error(await serverT("errors.invalidProduct"));
      if (product.stock < item.quantity) {
        throw new Error(await serverT("errors.insufficientStock"));
      }
      subtotal += Number(product.price) * item.quantity;
      currency = product.currency ?? DEFAULT_CURRENCY;
    }

    const { total } = cartTotals(subtotal);

    // Cash-on-delivery surcharge, configured by the admin in store settings.
    const cashSurcharge = Number(settingsResult.data?.cash_surcharge ?? 0);
    const cashFee =
      payload.paymentMethod === "cash" && cashSurcharge > 0
        ? roundMoney(cashSurcharge)
        : 0;
    const finalTotal = roundMoney(total + cashFee);

    const paymentStatus =
      payload.paymentMethod === "online" ? "pending" : "unpaid";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total: finalTotal,
        cash_fee: cashFee,
        currency,
        payment_method: payload.paymentMethod,
        payment_status: paymentStatus,
        delivery_slot: payload.deliverySlot,
        address_id: payload.addressId,
      })
      .select("*")
      .single();
    if (orderError) throw orderError;

    const orderItems = payload.items.map((item) => {
      const product = productMap.get(item.productId)!;
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        unit_price: Number(product.price),
      };
    });

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItems);
    if (itemsError) throw itemsError;

    try {
      await applyOrderStockDecrement(supabase, order.id);
    } catch (stockError) {
      await supabase.from("orders").delete().eq("id", order.id);
      throw stockError;
    }

    let checkoutUrl: string | null = null;
    if (payload.paymentMethod === "online") {
      const payment = await createPaymentForOrder(supabase, order as Order);
      checkoutUrl = payment.checkoutUrl;
    }

    await notifyAdminsOfNewOrder(order as Order);

    return {
      success: true as const,
      data: { order: order as Order, checkoutUrl },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.orderCreateFailed", err),
    };
  }
}

export async function assignRiderAction(orderId: string, riderId: string) {
  try {
    const { supabase } = await requireAdmin();
    const { data: current, error: currentError } = await supabase
      .from("orders")
      .select("id, status")
      .eq("id", orderId)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) throw new Error(await serverT("errors.orderNotFound"));
    if (current.status !== "preparing") {
      throw new Error(await serverT("errors.riderAssignNotReady"));
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ rider_id: riderId, status: "out_for_delivery" })
      .eq("id", orderId)
      .eq("status", "preparing")
      .select("*")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.riderAssignNotReady"));

    revalidatePath("/dashboard/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true as const, data: data as Order };
  } catch (err) {
    if (err instanceof Error && err.message) {
      const notReady = await serverT("errors.riderAssignNotReady");
      if (err.message === notReady) {
        return { success: false as const, error: notReady };
      }
    }
    return {
      success: false as const,
      error: await actionErrorMessage("errors.riderAssignFailed", err),
    };
  }
}

export async function getRidersAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("role", "rider")
      .order("full_name");
    if (error) throw error;

    const ids = (profiles ?? []).map((p) => p.id);
    const { data: details } = ids.length
      ? await supabase
          .from("rider_profiles")
          .select("profile_id, first_name, last_name, phone")
          .in("profile_id", ids)
      : { data: [] as { profile_id: string; first_name: string; last_name: string; phone: string }[] };

    const detailsMap = new Map((details ?? []).map((d) => [d.profile_id, d]));

    const data = (profiles ?? []).map((profile) => {
      const d = detailsMap.get(profile.id);
      const fullName = d
        ? `${d.first_name} ${d.last_name}`.trim()
        : profile.full_name;
      return {
        id: profile.id,
        full_name: fullName,
        phone: d?.phone || profile.phone,
      };
    });

    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ridersLoadFailed", err),
    };
  }
}

export async function updateOrderStatusAction(
  orderId: string,
  status: Order["status"],
) {
  try {
    const { supabase } = await requireAdmin();
    const { data: current, error: currentError } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .eq("id", orderId)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) throw new Error(await serverT("errors.orderNotFound"));

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) throw error;

    if (status === "cancelled" && current.status !== "cancelled") {
      await restoreOrderStock(supabase, current as Order);
    }

    revalidatePath("/dashboard/orders");
    revalidatePath(`/orders/${orderId}`);
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.statusUpdateFailed", err),
    };
  }
}
