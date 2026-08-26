/**
 * Temporary fixed-code login until a real SMS/OTP provider is enabled.
 *
 * Set OTP_BYPASS_ENABLED=false (and NEXT_PUBLIC_OTP_BYPASS_ENABLED=false)
 * when Supabase Phone OTP / SMS is live.
 */
const DEFAULT_CODE = "213141";

function parseEnabled(raw: string | undefined, fallback: boolean) {
  if (raw == null || raw.trim() === "") return fallback;
  const value = raw.trim().toLowerCase();
  if (value === "0" || value === "false" || value === "off" || value === "no") {
    return false;
  }
  return true;
}

/** Server-side: defaults ON so local + production work until SMS is ready. */
export function isOtpBypassEnabled() {
  return parseEnabled(process.env.OTP_BYPASS_ENABLED, true);
}

export function otpBypassCode() {
  const code = process.env.OTP_BYPASS_CODE?.trim();
  return code || DEFAULT_CODE;
}

/**
 * Client UI hints — must use NEXT_PUBLIC_* so the browser can show the code.
 * Defaults ON to match server until SMS is configured.
 */
export function isOtpBypassEnabledPublic() {
  return parseEnabled(process.env.NEXT_PUBLIC_OTP_BYPASS_ENABLED, true);
}

export function otpBypassCodePublic() {
  const code = process.env.NEXT_PUBLIC_OTP_BYPASS_CODE?.trim();
  return code || DEFAULT_CODE;
}
