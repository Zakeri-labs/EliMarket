"use server";

import { createClient } from "@/core/supabase/server";
import { createServiceRoleClient } from "@/core/supabase/service";
import {
  getCurrentProfile,
  getCurrentUser,
  mapProfileToSession,
  normalizePhone,
} from "@/core/supabase/auth-helpers";
import type {
  AdminSignInModel,
  ClientSession,
  SendOtpModel,
  VerifyOtpModel,
} from "@/app/_types/auth.types";
import type { Profile } from "@/app/_types/database.types";
import { resolveAdminEmail } from "@/config/admin-auth";
import { isOtpBypassEnabled, isTestPhone, otpBypassCode } from "@/config/otp-bypass";
import { actionErrorMessage } from "@/i18n/action-error";
import type { Locale } from "@/i18n/config";
import { getRequestLocale, serverT } from "@/i18n/server";
import { consumeOtp, issueOtp } from "@/lib/otp/otp-store";
import { sendSms, type SmsEncoding } from "@/lib/sms/ismart-sms";

/** Lang=64 in the iSmart SMS API means "send as Unicode", not literally
 * Arabic — Persian text also needs it since it isn't GSM-7 Latin script. */
function buildOtpMessage(locale: Locale, code: string): { text: string; encoding: SmsEncoding } {
  if (locale === "ar") {
    return {
      text: `رمز التحقق الخاص بك هو ${code}. صالح لمدة 5 دقائق.`,
      encoding: "unicode",
    };
  }
  if (locale === "fa") {
    return {
      text: `کد تایید شما ${code} است و تا ۵ دقیقه معتبر است.`,
      encoding: "unicode",
    };
  }
  return {
    text: `Your verification code is ${code}. It expires in 5 minutes.`,
    encoding: "latin",
  };
}

// TEMPORARY: fixed OTP until a real SMS provider is configured.
// Disable with OTP_BYPASS_ENABLED=false (and NEXT_PUBLIC_OTP_BYPASS_ENABLED=false).
const OTP_BYPASS_PASSWORD = "dev-otp-bypass-a1f3c9";

async function bypassOtpSignIn(phone: string) {
  const admin = createServiceRoleClient();
  // Phone Auth provider is off in this project ("Unsupported phone provider").
  // Use synthetic email/password only; keep the real number on profiles.phone.
  const phoneDigits = phone.replace(/[^0-9]/g, "");
  const bypassEmail = `otp-bypass-${phoneDigits}@dev.local`;

  const { data: userList, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;

  const existingByEmail = userList.users.find(
    (u) => u.email?.toLowerCase() === bypassEmail,
  );
  const { data: profileByPhone } = await admin
    .from("profiles")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();
  const existingUser =
    existingByEmail ??
    userList.users.find((u) => u.id === profileByPhone?.id) ??
    null;

  let userId = existingUser?.id ?? null;

  if (existingUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(
      existingUser.id,
      {
        email: bypassEmail,
        password: OTP_BYPASS_PASSWORD,
        email_confirm: true,
        user_metadata: { phone },
      },
    );
    if (updateError) throw updateError;
  } else {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: bypassEmail,
      password: OTP_BYPASS_PASSWORD,
      email_confirm: true,
      user_metadata: { phone },
    });
    if (createError) throw createError;
    userId = created.user?.id ?? null;
  }

  if (!userId) throw new Error(await serverT("errors.loginFailed"));

  await admin.from("profiles").upsert(
    {
      id: userId,
      phone,
    },
    { onConflict: "id" },
  );

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: bypassEmail,
    password: OTP_BYPASS_PASSWORD,
  });
  if (error) throw error;
  if (!data.user) throw new Error(await serverT("errors.loginFailed"));

  const profile = await getCurrentProfile();
  const session = mapProfileToSession(data.user.id, profile, phone, undefined);
  return { success: true as const, data: session };
}

export async function sendOtpAction(model: SendOtpModel) {
  try {
    const phone = normalizePhone(model.phone);

    if (isOtpBypassEnabled() || isTestPhone(phone)) {
      // No SMS provider yet, or a designated test number — skip send;
      // client verifies with otpBypassCode().
      return { success: true as const, data: { phone } };
    }

    const code = await issueOtp(phone);
    const locale = await getRequestLocale();
    const { text, encoding } = buildOtpMessage(locale, code);
    await sendSms(phone, text, encoding);

    return { success: true as const, data: { phone } };
  } catch (err) {
    if (err instanceof Error && err.message === "otp_rate_limited") {
      return {
        success: false as const,
        error: await serverT("errors.otpRateLimited"),
      };
    }
    return {
      success: false as const,
      error: await actionErrorMessage("errors.otpSendFailed", err),
    };
  }
}

export async function verifyOtpAction(model: VerifyOtpModel) {
  try {
    const phone = normalizePhone(model.phone);

    if (isOtpBypassEnabled() || isTestPhone(phone)) {
      if (model.token.trim() !== otpBypassCode()) {
        throw new Error(await serverT("errors.invalidOtp"));
      }
      return await bypassOtpSignIn(phone);
    }

    const verified = await consumeOtp(phone, model.token);
    if (!verified) throw new Error(await serverT("errors.invalidOtp"));
    return await bypassOtpSignIn(phone);
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.invalidOtp", err),
    };
  }
}

/**
 * Rider-panel OTP login. Same OTP flow as customers, but requires (or in
 * non-production, auto-promotes) the rider role so /rider proxy gates pass.
 */
export async function verifyRiderOtpAction(model: VerifyOtpModel) {
  try {
    const verified = await verifyOtpAction(model);
    if (!verified.success) return verified;

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false as const,
        error: await serverT("errors.loginFailed"),
      };
    }

    let profile = await getCurrentProfile();

    if (profile?.role !== "rider") {
      if (!isOtpBypassEnabled()) {
        const supabase = await createClient();
        await supabase.auth.signOut();
        return {
          success: false as const,
          error: await serverT("errors.riderForbidden"),
        };
      }

      // Bypass mode: promote whoever signs into the rider panel so testing
      // works without an admin registration step first.
      const admin = createServiceRoleClient();
      const phone = normalizePhone(model.phone);
      const phoneDigits = phone.replace(/\D/g, "");
      const civilId = phoneDigits.slice(-10).padStart(8, "0");

      const { data: updated, error: roleError } = await admin
        .from("profiles")
        .upsert(
          {
            id: user.id,
            phone,
            full_name: profile?.full_name || "Test Rider",
            role: "rider",
          },
          { onConflict: "id" },
        )
        .select("*")
        .single();
      if (roleError) throw roleError;
      profile = updated as Profile;

      // Best-effort KYC stub (migration may not be applied yet in local DB)
      await admin.from("rider_profiles").upsert(
        {
          profile_id: user.id,
          first_name: "Test",
          last_name: "Rider",
          civil_id: civilId,
          phone,
          address_line: "Dev test address",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "profile_id" },
      );
    }

    const session = mapProfileToSession(user.id, profile, model.phone, user.email);
    return { success: true as const, data: session };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.riderForbidden", err),
    };
  }
}

export async function verifyAdminAccessAction() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!user) throw new Error(await serverT("errors.loginFailed"));

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error(await serverT("errors.adminForbidden"));
    }

    const session = mapProfileToSession(
      user.id,
      profile as Profile,
      user.phone,
      user.email,
    );

    return { success: true as const, data: session };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.invalidCredentials", err),
    };
  }
}

export async function adminSignInAction(model: AdminSignInModel) {
  try {
    const supabase = await createClient();
    const email = resolveAdminEmail(model.username);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: model.password,
    });
    if (error) throw error;
    if (!data.user) throw new Error(await serverT("errors.loginFailed"));

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError) throw profileError;

    if (profile?.role !== "admin") {
      await supabase.auth.signOut();
      throw new Error(await serverT("errors.adminForbidden"));
    }

    const session = mapProfileToSession(
      data.user.id,
      profile as Profile,
      data.user.phone,
      data.user.email,
    );

    return { success: true as const, data: session };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.invalidCredentials", err),
    };
  }
}

export async function signOutAction() {
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.signOutFailed", err),
    };
  }
}

export async function getSessionAction() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: true as const, data: null as ClientSession | null };
    }
    const profile = await getCurrentProfile();
    return {
      success: true as const,
      data: mapProfileToSession(user.id, profile, user.phone, user.email),
    };
  } catch {
    return { success: true as const, data: null as ClientSession | null };
  }
}
