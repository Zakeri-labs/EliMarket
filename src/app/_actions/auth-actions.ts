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
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";

// TEMPORARY: no SMS provider is wired up yet, so real OTP delivery isn't
// possible. Until that's configured, any phone number can be "verified"
// with this fixed code so the login flow can be tested end-to-end. This is
// hard-gated to non-production builds — remove this whole block once the
// real SMS provider is configured in Supabase.
const DEV_OTP_CODE = "123456";
const DEV_OTP_PASSWORD = "dev-otp-bypass-a1f3c9";
const isDevOtpBypassEnabled = process.env.NODE_ENV !== "production";

async function devOtpSignIn(phone: string) {
  const admin = createServiceRoleClient();
  // The project's Supabase "Phone" auth provider is off (no SMS provider
  // configured), so even signInWithPassword({phone}) is rejected with
  // "Phone logins are disabled". Route through a synthetic email instead —
  // email/password auth is already enabled (used by admin login) — while
  // still keeping the real phone number on the user record.
  const devEmail = `otp-bypass-${phone.replace(/[^0-9]/g, "")}@dev.local`;

  // Look up by phone directly against auth.users (via listUsers) rather than
  // the profiles table — a phone can exist on an auth user without a
  // matching profile row (e.g. left over from an earlier test), and
  // createUser() then fails with "Phone number already registered".
  const { data: userList, error: listError } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (listError) throw listError;
  const existingUser = userList.users.find((u) => u.phone === phone.replace(/^\+/, ""));

  if (existingUser) {
    const { error: updateError } = await admin.auth.admin.updateUserById(existingUser.id, {
      email: devEmail,
      password: DEV_OTP_PASSWORD,
      email_confirm: true,
    });
    if (updateError) throw updateError;
  } else {
    const { error: createError } = await admin.auth.admin.createUser({
      phone,
      email: devEmail,
      password: DEV_OTP_PASSWORD,
      phone_confirm: true,
      email_confirm: true,
    });
    if (createError) throw createError;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: devEmail,
    password: DEV_OTP_PASSWORD,
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

    if (isDevOtpBypassEnabled) {
      // No SMS provider configured yet — skip the real send and let the
      // caller continue straight to the code step with DEV_OTP_CODE.
      return { success: true as const, data: { phone } };
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
    return { success: true as const, data: { phone } };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.otpSendFailed", err),
    };
  }
}

export async function verifyOtpAction(model: VerifyOtpModel) {
  try {
    const phone = normalizePhone(model.phone);

    if (isDevOtpBypassEnabled && model.token === DEV_OTP_CODE) {
      return await devOtpSignIn(phone);
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token: model.token,
      type: "sms",
    });
    if (error) throw error;
    if (!data.user) throw new Error(await serverT("errors.loginFailed"));

    const profile = await getCurrentProfile();
    const session = mapProfileToSession(
      data.user.id,
      profile,
      data.user.phone,
      data.user.email,
    );

    return { success: true as const, data: session };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.invalidOtp", err),
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
