import { createHmac, timingSafeEqual } from "node:crypto";
import { publicEnv } from "@/config/env";
import { toMinorUnits } from "@/config/brand";

export type ThawaniSession = {
  session_id?: string;
  client_reference_id?: string;
  payment_status?: string;
  invoice?: string;
  total_amount?: number;
  currency?: string;
};

export type ThawaniCustomer = {
  name: string;
  phone: string;
  email: string;
};

/** In live mode there is no sandbox fallback: a failed charge must never look paid. */
export function isThawaniLive() {
  return process.env.THAWANI_MODE === "live";
}

function thawaniBaseUrl() {
  return isThawaniLive()
    ? "https://checkout.thawani.om/api/v1"
    : "https://uatcheckout.thawani.om/api/v1";
}

function thawaniPayUrl() {
  return isThawaniLive()
    ? "https://checkout.thawani.om/pay"
    : "https://uatcheckout.thawani.om/pay";
}

export function isThawaniConfigured() {
  return Boolean(
    process.env.THAWANI_SECRET_KEY?.trim() &&
      process.env.THAWANI_PUBLISHABLE_KEY?.trim(),
  );
}

export async function createThawaniCheckoutSession(input: {
  clientReferenceId: string;
  amount: number;
  productName: string;
  successUrl: string;
  cancelUrl: string;
  customer: ThawaniCustomer;
}) {
  const secret = process.env.THAWANI_SECRET_KEY?.trim();
  const publishable = process.env.THAWANI_PUBLISHABLE_KEY?.trim();
  if (!secret || !publishable) {
    throw new Error("Thawani keys are not configured");
  }

  const response = await fetch(`${thawaniBaseUrl()}/checkout/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "thawani-api-key": secret,
    },
    body: JSON.stringify({
      client_reference_id: input.clientReferenceId,
      mode: "payment",
      products: [
        {
          name: input.productName.slice(0, 40) || "EliMarket",
          quantity: 1,
          unit_amount: toMinorUnits(input.amount),
        },
      ],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      // Thawani's go-live checklist requires customer details on every session.
      metadata: {
        order_id: input.clientReferenceId,
        "Customer name": input.customer.name.slice(0, 100),
        "Customer phone": input.customer.phone.slice(0, 30),
        "Customer email": input.customer.email.slice(0, 100),
      },
    }),
  });

  const payload = (await response.json().catch(() => null)) as
    | { data?: ThawaniSession; description?: string }
    | null;

  if (!response.ok || !payload?.data?.session_id) {
    throw new Error(payload?.description || "Thawani session failed");
  }

  return {
    sessionId: payload.data.session_id,
    checkoutUrl: `${thawaniPayUrl()}/${payload.data.session_id}?key=${publishable}`,
    payload,
  };
}

export async function getThawaniCheckoutSession(sessionId: string) {
  const secret = process.env.THAWANI_SECRET_KEY?.trim();
  if (!secret) throw new Error("Thawani keys are not configured");

  const response = await fetch(
    `${thawaniBaseUrl()}/checkout/session/${encodeURIComponent(sessionId)}`,
    {
      headers: { "thawani-api-key": secret },
      cache: "no-store",
    },
  );
  const payload = (await response.json().catch(() => null)) as
    | { data?: ThawaniSession; description?: string }
    | null;
  if (!response.ok || !payload?.data) {
    throw new Error(payload?.description || "Thawani lookup failed");
  }
  return payload.data;
}

/**
 * Webhook signature: HMAC-SHA256 (hex) of `${rawBody}-${thawani-timestamp}`,
 * keyed with the webhook secret set in the Thawani merchant portal.
 *
 * Thawani's sample encodes with ASCII while a body containing Arabic
 * (customer names) is not ASCII, so both UTF-8 and ASCII encodings are tried.
 * Callers must still re-fetch the session from Thawani before trusting it.
 */
export function verifyThawaniWebhookSignature(
  rawBody: string,
  timestamp: string | null,
  signature: string | null,
) {
  const secret = process.env.THAWANI_WEBHOOK_SECRET?.trim();
  if (!secret || !timestamp || !signature) return false;

  const given = Buffer.from(signature.trim().toLowerCase(), "hex");
  if (given.length !== 32) return false;

  const message = `${rawBody}-${timestamp}`;
  const key = Buffer.from(secret, "utf8");

  return (["utf8", "ascii"] as const).some((encoding) => {
    const expected = createHmac("sha256", key)
      .update(Buffer.from(message, encoding))
      .digest();
    return timingSafeEqual(expected, given);
  });
}

export function paymentAppUrl() {
  return publicEnv.appUrl.replace(/\/$/, "");
}
