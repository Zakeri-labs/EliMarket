"use server";

import { createClient } from "@/core/supabase/server";
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

export async function sendOtpAction(model: SendOtpModel) {
  try {
    const supabase = await createClient();
    const phone = normalizePhone(model.phone);
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
    const supabase = await createClient();
    const phone = normalizePhone(model.phone);
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
