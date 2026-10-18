"use server";

import { createClient } from "@/core/supabase/server";
import { createServiceRoleClient } from "@/core/supabase/service";
import { requireAuth } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import { DEFAULT_CURRENCY } from "@/config/brand";
import {
  createThawaniCheckoutSession,
  isThawaniConfigured,
  isThawaniLive,
  paymentAppUrl,
  type ThawaniCustomer,
} from "@/lib/payments/thawani";
import { settleThawaniPayment } from "@/lib/payments/settle";
import { restoreOrderStock } from "@/lib/inventory/stock";
import type { Order, Payment } from "@/app/_types/database.types";

type DbClient = Awaited<ReturnType<typeof createClient>>;

async function getOwnedPayment(paymentId: string) {
  const { supabase, user, profile } = await requireAuth();
  const { data, error } = await supabase
    .from("payments")
    .select("*, order:orders(*, order_items(*))")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error(await serverT("errors.paymentNotFound"));
  const payment = data as Payment & { order: Order | null };
  if (profile?.role !== "admin" && payment.order?.user_id !== user.id) {
    throw new Error(await serverT("errors.accessDenied"));
  }
  return { supabase, payment };
}

export async function getPaymentAction(paymentId: string) {
  try {
    const { payment } = await getOwnedPayment(paymentId);
    return { success: true as const, data: payment };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.paymentNotFound", err),
    };
  }
}

/** Live mode never falls back to the sandbox, so a failed start must release the order. */
async function abortUnpayableOrder(order: Order) {
  const service = createServiceRoleClient();
  await service
    .from("orders")
    .update({ payment_status: "failed", status: "cancelled" })
    .eq("id", order.id);
  await restoreOrderStock(service, order);
}

export async function createPaymentForOrder(
  supabase: DbClient,
  order: Order,
  customer: ThawaniCustomer,
) {
  if (isThawaniLive() && !isThawaniConfigured()) {
    console.error("[thawani] live mode is on but the API keys are missing");
    await abortUnpayableOrder(order);
    throw new Error(await serverT("errors.paymentCreateFailed"));
  }

  const { data: payment, error } = await supabase
    .from("payments")
    .insert({
      order_id: order.id,
      provider: isThawaniConfigured() ? "thawani" : "sandbox",
      amount: Number(order.total),
      currency: order.currency || DEFAULT_CURRENCY,
      status: "pending",
    })
    .select("*")
    .single();
  if (error) throw error;

  const appUrl = paymentAppUrl();
  const sandboxUrl = `${appUrl}/pay/${payment.id}`;

  if (!isThawaniConfigured()) {
    return { payment: payment as Payment, checkoutUrl: sandboxUrl };
  }

  try {
    const session = await createThawaniCheckoutSession({
      clientReferenceId: order.id,
      amount: Number(order.total),
      productName: `EliMarket #${order.id.slice(0, 8)}`,
      successUrl: `${appUrl}/pay/${payment.id}/return?session_id={SESSION_ID}`,
      cancelUrl: `${sandboxUrl}?cancelled=1`,
      customer,
    });

    await supabase
      .from("payments")
      .update({
        provider_session_id: session.sessionId,
        raw_payload: session.payload,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    return {
      payment: {
        ...payment,
        provider_session_id: session.sessionId,
      } as Payment,
      checkoutUrl: session.checkoutUrl,
    };
  } catch (err) {
    console.error("[thawani] checkout session creation failed", err);

    if (isThawaniLive()) {
      await supabase
        .from("payments")
        .update({ status: "failed", updated_at: new Date().toISOString() })
        .eq("id", payment.id);
      await abortUnpayableOrder(order);
      throw new Error(await serverT("errors.paymentCreateFailed"));
    }

    // Development / UAT only: fall back to the fake pay page.
    await supabase
      .from("payments")
      .update({
        provider: "sandbox",
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);
    return { payment: payment as Payment, checkoutUrl: sandboxUrl };
  }
}

export async function confirmSandboxPaymentAction(paymentId: string) {
  try {
    const { supabase, payment } = await getOwnedPayment(paymentId);
    if (payment.provider !== "sandbox" || isThawaniLive()) {
      throw new Error(await serverT("errors.paymentVerifyFailed"));
    }
    if (payment.status === "paid") {
      return { success: true as const, data: payment };
    }

    // Marking a payment "paid" grants value, so it must go through the
    // service-role client — RLS blocks a customer from doing this to their
    // own payment row directly (see 20260828000000_security_hardening.sql).
    const service = createServiceRoleClient();
    const { data: updated, error } = await service
      .from("payments")
      .update({
        status: "paid",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select("*")
      .single();
    if (error) throw error;

    await service
      .from("orders")
      .update({ payment_status: "paid", status: "confirmed" })
      .eq("id", payment.order_id);

    return { success: true as const, data: updated as Payment };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.paymentVerifyFailed", err),
    };
  }
}

export async function cancelPaymentAction(paymentId: string) {
  try {
    const { supabase, payment } = await getOwnedPayment(paymentId);
    if (payment.status === "paid" || payment.status === "cancelled") {
      return { success: true as const, data: payment };
    }

    const { data: updated, error } = await supabase
      .from("payments")
      .update({
        status: "cancelled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", paymentId)
      .select("*")
      .single();
    if (error) throw error;

    if (payment.order?.payment_status !== "failed") {
      // Cancelling doesn't grant value, but the order row itself still has
      // no customer-owned UPDATE policy, so this write also needs the
      // service-role client to actually take effect.
      const service = createServiceRoleClient();
      await service
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", payment.order_id);
      if (payment.order) {
        await restoreOrderStock(service, payment.order);
      }
    }

    return { success: true as const, data: updated as Payment };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.paymentVerifyFailed", err),
    };
  }
}

export async function verifyThawaniPaymentAction(paymentId: string) {
  try {
    // Ownership check only; the state change (and the only "paid" write) lives
    // in settleThawaniPayment, which checks the stored session with Thawani.
    await getOwnedPayment(paymentId);
    const { paid, orderId } = await settleThawaniPayment(paymentId);
    return { success: true as const, data: { paid, orderId } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.paymentVerifyFailed", err),
    };
  }
}
