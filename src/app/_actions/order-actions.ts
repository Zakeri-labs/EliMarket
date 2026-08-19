"use server";

import { createClient } from "@/core/supabase/server";
import { requireAdmin, requireAuth } from "@/core/supabase/auth-helpers";
import { getStoreSettingsAction } from "@/app/_actions/settings-actions";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type { Order, PaymentMethod } from "@/app/_types/database.types";

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
      error: extractActionErrorMessage(err, "بارگذاری سفارش‌ها ناموفق بود"),
    };
  }
}

export async function getOrderByIdAction(id: string) {
  try {
    const { supabase, user, profile } = await requireAuth();
    let query = supabase
      .from("orders")
      .select("*, order_items(*, product:products(*)), address:addresses(*)")
      .eq("id", id)
      .maybeSingle();

    const { data, error } = await query;
    if (error) throw error;
    if (!data) throw new Error("سفارش یافت نشد");
    if (profile?.role !== "admin" && data.user_id !== user.id) {
      throw new Error("دسترسی مجاز نیست");
    }
    return { success: true as const, data: data as Order };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "سفارش یافت نشد"),
    };
  }
}

export async function createOrderAction(payload: {
  items: Array<{ productId: string; quantity: number }>;
  addressId: string;
  deliverySlot: string;
  paymentMethod: PaymentMethod;
}) {
  try {
    const { supabase, user } = await requireAuth();

    const settingsResult = await getStoreSettingsAction();
    if (!settingsResult.data?.show_prices) {
      throw new Error("ثبت سفارش در حالت مخفی بودن قیمت غیرفعال است");
    }

    if (!payload.items.length) throw new Error("سبد خرید خالی است");

    const productIds = payload.items.map((i) => i.productId);
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price, currency, stock, is_active")
      .in("id", productIds);
    if (productsError) throw productsError;

    const productMap = new Map((products ?? []).map((p) => [p.id, p]));
    let total = 0;
    let currency = "IRR";

    for (const item of payload.items) {
      const product = productMap.get(item.productId);
      if (!product?.is_active) throw new Error("محصول نامعتبر است");
      if (product.stock < item.quantity) throw new Error("موجودی کافی نیست");
      total += Number(product.price) * item.quantity;
      currency = product.currency ?? "IRR";
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        total,
        currency,
        payment_method: payload.paymentMethod,
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

    return { success: true as const, data: order as Order };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "ثبت سفارش ناموفق بود"),
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
      error: extractActionErrorMessage(err, "تخصیص پیک ناموفق بود"),
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
      error: extractActionErrorMessage(err, "بارگذاری پیک‌ها ناموفق بود"),
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
      error: extractActionErrorMessage(err, "به‌روزرسانی وضعیت ناموفق بود"),
    };
  }
}
