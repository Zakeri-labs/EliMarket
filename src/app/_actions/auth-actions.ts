"use server";

import { createClient } from "@/core/supabase/server";
import {
  getCurrentProfile,
  getCurrentUser,
  mapProfileToSession,
  normalizePhone,
} from "@/core/supabase/auth-helpers";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import type {
  ClientSession,
  SendOtpModel,
  VerifyOtpModel,
} from "@/app/_types/auth.types";

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
      error: extractActionErrorMessage(err, "ارسال کد تأیید ناموفق بود"),
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
    if (!data.user) throw new Error("ورود ناموفق بود");

    const profile = await getCurrentProfile();
    const session = mapProfileToSession(
      data.user.id,
      profile,
      data.user.phone,
    );

    return { success: true as const, data: session };
  } catch (err) {
    return {
      success: false as const,
      error: extractActionErrorMessage(err, "کد تأیید نامعتبر است"),
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
      error: extractActionErrorMessage(err, "خروج ناموفق بود"),
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
      data: mapProfileToSession(user.id, profile, user.phone),
    };
  } catch {
    return { success: true as const, data: null as ClientSession | null };
  }
}
