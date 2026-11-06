import { createHash, timingSafeEqual } from "node:crypto";
import { sendSms, SmsSendError, type SmsEncoding } from "@/lib/sms/ismart-sms";

export const runtime = "nodejs";

/**
 * SMS relay for our other projects (first user: the football academy site on
 * Vercel). Infocomm only accepts requests from whitelisted IPs; this app runs
 * on the Oman server whose IP is whitelisted, while Vercel has no fixed IP. So
 * the other project POSTs here and this server talks to iSmart SMS, using the
 * relay's own iSmart account (SMS_RELAY_*), not this shop's account.
 *
 * Auth: `Authorization: Bearer <SMS_RELAY_SECRET>`.
 * Body: { "phone": "96891234567", "message": "...", "encoding"?: "latin" | "unicode" }
 */

const PER_PHONE_LIMIT = 3; // messages per phone per window
const PER_PHONE_WINDOW_MS = 10 * 60_000;
const GLOBAL_LIMIT = 60; // messages per minute across all phones
const GLOBAL_WINDOW_MS = 60_000;
const DAILY_LIMIT = 500; // hard cap on spend if the secret ever leaks
const DAY_MS = 24 * 60 * 60_000;
const MAX_MESSAGE_LENGTH = 480;
const MAX_BODY_BYTES = 4096;

// In-memory counters: valid only because the app runs as ONE container/process.
// They reset on restart; move them to a shared store before scaling out.
const phoneHits = new Map<string, number[]>();
let globalHits: number[] = [];
let dailyHits: number[] = [];

function allow(phone: string, now: number) {
  globalHits = globalHits.filter((t) => now - t < GLOBAL_WINDOW_MS);
  dailyHits = dailyHits.filter((t) => now - t < DAY_MS);
  if (globalHits.length >= GLOBAL_LIMIT || dailyHits.length >= DAILY_LIMIT) return false;

  const hits = (phoneHits.get(phone) ?? []).filter((t) => now - t < PER_PHONE_WINDOW_MS);
  if (hits.length >= PER_PHONE_LIMIT) {
    phoneHits.set(phone, hits);
    return false;
  }
  hits.push(now);
  phoneHits.set(phone, hits);
  globalHits.push(now);
  dailyHits.push(now);

  // Keep the map from growing forever.
  if (phoneHits.size > 5000) {
    for (const [key, times] of phoneHits) {
      if (times.every((t) => now - t >= PER_PHONE_WINDOW_MS)) phoneHits.delete(key);
    }
  }
  return true;
}

/** A send the provider rejected (e.g. wrong account) should not use up the caller's quota. */
function refund(phone: string, now: number) {
  const drop = (list: number[]) => {
    const i = list.lastIndexOf(now);
    if (i !== -1) list.splice(i, 1);
  };
  drop(globalHits);
  drop(dailyHits);
  const hits = phoneHits.get(phone);
  if (hits) drop(hits);
}

/** "0096891234567", "+968 9123 4567" and "91234567" all become "96891234567". */
function normalizePhone(raw: string) {
  let digits = raw.replace(/[^0-9]/g, "").replace(/^00/, "");
  if (digits.length === 8) digits = `968${digits}`;
  return digits;
}

function secretMatches(given: string, expected: string) {
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.SMS_RELAY_SECRET?.trim();
  const userId = process.env.SMS_RELAY_USERNAME?.trim();
  const password = process.env.SMS_RELAY_PASSWORD;
  const header = process.env.SMS_RELAY_HEADER?.trim();
  if (!secret || secret.length < 32 || !userId || !password || !header) {
    console.error("[sms-relay] SMS_RELAY_* environment variables are not configured");
    return Response.json({ ok: false, error: "relay_not_configured" }, { status: 503 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!token || !secretMatches(token, secret)) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: { phone?: unknown; message?: unknown; encoding?: unknown };
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) {
      return Response.json({ ok: false, error: "body_too_large" }, { status: 413 });
    }
    body = JSON.parse(text);
  } catch {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : "";
  const message = typeof body.message === "string" ? body.message.trim() : "";
  const encoding: SmsEncoding = body.encoding === "unicode" ? "unicode" : "latin";

  if (phone.length < 8 || phone.length > 15) {
    return Response.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return Response.json({ ok: false, error: "invalid_message" }, { status: 400 });
  }
  const now = Date.now();
  if (!allow(phone, now)) {
    return Response.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  try {
    await sendSms(phone, message, encoding, { userId, password, header });
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof SmsSendError) {
      refund(phone, now);
      console.error(`[sms-relay] iSmart code ${error.code}: ${error.message}`);
      return Response.json(
        { ok: false, error: "provider_error", code: error.code },
        { status: 502 },
      );
    }
    console.error("[sms-relay] send failed", error);
    return Response.json({ ok: false, error: "send_failed" }, { status: 502 });
  }
}
