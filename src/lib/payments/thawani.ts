import { publicEnv } from "@/config/env";
import { toMinorUnits } from "@/config/brand";

type ThawaniSession = {
  session_id?: string;
  payment_status?: string;
  invoice?: string;
};

function thawaniBaseUrl() {
  return process.env.THAWANI_MODE === "live"
    ? "https://checkout.thawani.om/api/v1"
    : "https://uatcheckout.thawani.om/api/v1";
}

function thawaniPayUrl() {
  return process.env.THAWANI_MODE === "live"
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
      metadata: { order_id: input.clientReferenceId },
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
    `${thawaniBaseUrl()}/checkout/session/${sessionId}`,
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

export function paymentAppUrl() {
  return publicEnv.appUrl.replace(/\/$/, "");
}
