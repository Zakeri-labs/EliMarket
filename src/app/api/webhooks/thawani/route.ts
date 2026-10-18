import { createServiceRoleClient } from "@/core/supabase/service";
import { verifyThawaniWebhookSignature } from "@/lib/payments/thawani";
import { settleThawaniPayment } from "@/lib/payments/settle";

export const runtime = "nodejs";

/**
 * Thawani payment notifications. The signature only proves the request came
 * from Thawani; the payment state itself is always re-read from Thawani's API
 * inside settleThawaniPayment, so a replayed or forged body cannot mark an
 * order as paid.
 */
export async function POST(request: Request) {
  if (!process.env.THAWANI_WEBHOOK_SECRET?.trim()) {
    console.error("[thawani-webhook] THAWANI_WEBHOOK_SECRET is not configured");
    return new Response("Webhook not configured", { status: 503 });
  }

  const rawBody = await request.text();
  const valid = verifyThawaniWebhookSignature(
    rawBody,
    request.headers.get("thawani-timestamp"),
    request.headers.get("thawani-signature"),
  );
  if (!valid) {
    return new Response("Invalid signature", { status: 401 });
  }

  let event: { event_type?: string; data?: { session_id?: string } };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid body", { status: 400 });
  }

  // Only checkout.completed carries the session id; payment.* events are
  // informational and a failed attempt can still be retried within a session.
  if (event.event_type !== "checkout.completed") {
    return Response.json({ received: true });
  }

  const sessionId = event.data?.session_id;
  if (!sessionId) {
    return new Response("Missing session id", { status: 400 });
  }

  try {
    const service = createServiceRoleClient();
    const { data: payment, error } = await service
      .from("payments")
      .select("id")
      .eq("provider", "thawani")
      .eq("provider_session_id", sessionId)
      .maybeSingle();
    if (error) throw error;
    if (!payment) {
      console.error("[thawani-webhook] unknown session", sessionId);
      return new Response("Unknown session", { status: 404 });
    }

    const result = await settleThawaniPayment(payment.id);
    return Response.json({ received: true, paid: result.paid });
  } catch (err) {
    console.error("[thawani-webhook] settle failed", err);
    return new Response("Processing failed", { status: 500 });
  }
}
