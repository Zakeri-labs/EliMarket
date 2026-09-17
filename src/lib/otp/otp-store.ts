import crypto from "crypto";
import { createServiceRoleClient } from "@/core/supabase/service";

const OTP_TTL_MINUTES = 5;
const OTP_RESEND_COOLDOWN_SECONDS = 120;
const OTP_MAX_ATTEMPTS = 5;

function hashCode(phone: string, code: string) {
  return crypto.createHash("sha256").update(`${phone}:${code}`).digest("hex");
}

function generateCode() {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
}

/** Creates and stores a new OTP for `phone`, enforcing a resend cooldown. */
export async function issueOtp(phone: string): Promise<string> {
  const admin = createServiceRoleClient();

  const { data: recent, error: recentError } = await admin
    .from("otp_codes")
    .select("created_at")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (recentError) throw recentError;

  if (recent) {
    const elapsedMs = Date.now() - new Date(recent.created_at).getTime();
    if (elapsedMs < OTP_RESEND_COOLDOWN_SECONDS * 1000) {
      throw new Error("otp_rate_limited");
    }
  }

  const code = generateCode();
  const { error } = await admin.from("otp_codes").insert({
    phone,
    code_hash: hashCode(phone, code),
    expires_at: new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000).toISOString(),
  });
  if (error) throw error;

  return code;
}

/** Verifies `submittedCode` against the latest OTP for `phone` and consumes it on success. */
export async function consumeOtp(phone: string, submittedCode: string): Promise<boolean> {
  const admin = createServiceRoleClient();

  const { data: entry, error } = await admin
    .from("otp_codes")
    .select("id, code_hash, expires_at, consumed_at, attempts")
    .eq("phone", phone)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!entry || entry.consumed_at) return false;
  if (new Date(entry.expires_at).getTime() < Date.now()) return false;
  if (entry.attempts >= OTP_MAX_ATTEMPTS) return false;

  const matches = entry.code_hash === hashCode(phone, submittedCode.trim());

  if (matches) {
    await admin
      .from("otp_codes")
      .update({ consumed_at: new Date().toISOString() })
      .eq("id", entry.id);
  } else {
    await admin
      .from("otp_codes")
      .update({ attempts: entry.attempts + 1 })
      .eq("id", entry.id);
  }

  return matches;
}
