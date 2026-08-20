"use server";

import { requireAdmin, requireAuth } from "@/core/supabase/auth-helpers";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import { createPaymentForOrder } from "@/app/_actions/payment-actions";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { DEFAULT_CURRENCY, cartTotals } from "@/config/brand";
import type {
  CreateOrderResult,
  Order,
  PaymentMethod,
} from "@/app/_types/database.types";

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
    return { success: true as const, data: (data ?? []) as Order[] };
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
      .select("id, price, currency, stock, is_active")
      .in("id", productIds);
    if (productsError) throw productsError;

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));
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
    const paymentStatus =
      payload.paymentMethod === "online" ? "pending" : "unpaid";

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total,
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

    for (const item of payload.items) {
      const product = productMap.get(item.productId)!;
      await supabase
        .from("products")
        .update({ stock: product.stock - item.quantity })
        .eq("id", item.productId);
    }

    let checkoutUrl: string | null = null;
    if (payload.paymentMethod === "online") {
      const payment = await createPaymentForOrder(supabase, order as Order);
      checkoutUrl = payment.checkoutUrl;
    }

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
    const { data, error } = await supabase
      .from("orders")
      .update({ rider_id: riderId, status: "out_for_delivery" })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.riderAssignFailed", err),
    };
  }
}

export async function getRidersAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone")
      .eq("role", "rider")
      .order("full_name");
    if (error) throw error;
    return { success: true as const, data: data ?? [] };
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
    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", orderId)
      .select("*")
      .single();
    if (error) throw error;
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.statusUpdateFailed", err),
    };
  }
}
