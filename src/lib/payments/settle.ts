import { createServiceRoleClient } from "@/core/supabase/service";
import { toMinorUnits } from "@/config/brand";
import { restoreOrderStock } from "@/lib/inventory/stock";
import { getThawaniCheckoutSession } from "@/lib/payments/thawani";
import type { Order, Payment } from "@/app/_types/database.types";

export type SettleResult = { paid: boolean; orderId: string };

/**
 * Single place that turns a Thawani session into a payment/order state.
 * Shared by the customer return page and the webhook, so both are idempotent
 * and apply identical checks.
 *
 * The session id is always the one stored when we created the session, never a
 * value supplied by the caller — otherwise a customer could present the paid
 * session of a cheap order as proof of payment for an expensive one.
 * Caller is responsible for authorising access to `paymentId`.
 */
export async function settleThawaniPayment(
  paymentId: string,
): Promise<SettleResult> {
  const service = createServiceRoleClient();

  const { data, error } = await service
    .from("payments")
    .select("*, order:orders(*)")
    .eq("id", paymentId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Payment not found");

  const payment = data as Payment & { order: Order | null };
  const order = payment.order;
  if (!order) throw new Error("Order not found for payment");
  if (payment.provider !== "thawani" || !payment.provider_session_id) {
    throw new Error("Payment is not a Thawani payment");
  }
  if (payment.status === "paid") {
    return { paid: true, orderId: order.id };
  }

  const session = await getThawaniCheckoutSession(payment.provider_session_id);

  if (session.client_reference_id !== order.id) {
    throw new Error("Thawani session does not belong to this order");
  }

  if (session.payment_status === "paid") {
    if (
      session.total_amount !== toMinorUnits(Number(payment.amount)) ||
      (session.currency && session.currency !== payment.currency)
    ) {
      throw new Error("Thawani paid amount does not match the order total");
    }

    await service
      .from("payments")
      .update({
        status: "paid",
        raw_payload: session,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    // If the customer already abandoned the order (stock restored), keep it
    // cancelled but record that money was received so an admin can refund it.
    const orderUpdate =
      order.status === "pending"
        ? { payment_status: "paid", status: "confirmed" }
        : { payment_status: "paid" };
    await service.from("orders").update(orderUpdate).eq("id", order.id);

    return { paid: true, orderId: order.id };
  }

  if (session.payment_status === "cancelled" || session.payment_status === "expired") {
    await service
      .from("payments")
      .update({
        status: "failed",
        raw_payload: session,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payment.id);

    if (order.payment_status !== "failed") {
      await service
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", order.id);
      await restoreOrderStock(service, order);
    }
  }

  // "unpaid" means the customer has not finished yet — leave everything as is.
  return { paid: false, orderId: order.id };
}
