"use server";

import { revalidatePath } from "next/cache";
import { normalizePhone, requireAdmin } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import type { Profile, RiderProfile } from "@/app/_types/database.types";

export type RiderDetailsInput = {
  firstName: string;
  lastName: string;
  civilId: string;
  phone: string;
  addressLine: string;
};

export type AdminRider = Pick<Profile, "id" | "full_name" | "phone" | "created_at" | "role"> & {
  details: RiderProfile | null;
};

function normalizeCivilId(raw: string) {
  return raw.replace(/\s+/g, "").trim();
}

function validateRiderDetails(input: RiderDetailsInput) {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const civilId = normalizeCivilId(input.civilId);
  const phone = normalizePhone(input.phone);
  const addressLine = input.addressLine.trim();

  const phoneDigits = phone.replace(/\D/g, "");
  if (!firstName || !lastName || !civilId || !addressLine || phoneDigits.length < 8) {
    throw new Error("Missing required rider fields");
  }
  // Oman Civil Number (رقم مدني): typically 8–14 digits
  if (!/^\d{8,14}$/.test(civilId)) {
    throw new Error("Invalid civil id");
  }

  return {
    firstName,
    lastName,
    civilId,
    phone,
    addressLine,
    fullName: `${firstName} ${lastName}`.trim(),
  };
}

async function upsertRiderDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  admin: any,
  profileId: string,
  details: ReturnType<typeof validateRiderDetails>,
) {
  const now = new Date().toISOString();
  const { data, error } = await admin
    .from("rider_profiles")
    .upsert(
      {
        profile_id: profileId,
        first_name: details.firstName,
        last_name: details.lastName,
        civil_id: details.civilId,
        phone: details.phone,
        address_line: details.addressLine,
        updated_at: now,
      },
      { onConflict: "profile_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data as RiderProfile;
}

export async function getAdminRidersAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, role")
      .eq("role", "rider")
      .order("created_at", { ascending: false });
    if (error) throw error;

    const ids = (profiles ?? []).map((p) => p.id);
    const { data: detailsRows } = ids.length
      ? await supabase.from("rider_profiles").select("*").in("profile_id", ids)
      : { data: [] as RiderProfile[] };

    const detailsMap = new Map((detailsRows ?? []).map((d) => [d.profile_id, d as RiderProfile]));

    const data: AdminRider[] = (profiles ?? []).map((profile) => ({
      ...profile,
      details: detailsMap.get(profile.id) ?? null,
    }));

    return { success: true as const, data };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.ridersLoadFailed", err),
    };
  }
}

export async function getRiderCandidatesAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, phone, created_at, role")
      .eq("role", "customer")
      .not("phone", "is", null)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    const list: AdminRider[] = (data ?? []).map((profile) => ({
      ...profile,
      details: null,
    }));
    return { success: true as const, data: list };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.customersLoadFailed", err),
    };
  }
}

/** Approve an existing customer as rider — requires complete identity details. */
export async function approveRiderAction(profileId: string, input: RiderDetailsInput) {
  try {
    const { supabase } = await requireAdmin();
    const details = validateRiderDetails(input);
    const admin = createServiceRoleClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .update({
        role: "rider",
        full_name: details.fullName,
        phone: details.phone,
      })
      .eq("id", profileId)
      .eq("role", "customer")
      .select("id, full_name, phone, created_at, role")
      .maybeSingle();
    if (error) throw error;
    if (!profile) throw new Error(await serverT("errors.riderApproveFailed"));

    const riderDetails = await upsertRiderDetails(admin, profileId, details);

    revalidatePath("/dashboard/riders");
    revalidatePath("/dashboard/orders");
    return {
      success: true as const,
      data: { ...profile, details: riderDetails } as AdminRider,
    };
  } catch (err) {
    const message =
      err instanceof Error && err.message === "Invalid civil id"
        ? await serverT("errors.riderCivilIdInvalid")
        : await actionErrorMessage("errors.riderApproveFailed", err);
    return { success: false as const, error: message };
  }
}

export async function revokeRiderAction(profileId: string) {
  try {
    const { supabase } = await requireAdmin();
    const admin = createServiceRoleClient();

    const { data, error } = await supabase
      .from("profiles")
      .update({ role: "customer" })
      .eq("id", profileId)
      .eq("role", "rider")
      .select("id, full_name, phone, created_at, role")
      .maybeSingle();
    if (error) throw error;
    if (!data) throw new Error(await serverT("errors.riderRevokeFailed"));

    await admin.from("rider_profiles").delete().eq("profile_id", profileId);

    revalidatePath("/dashboard/riders");
    revalidatePath("/dashboard/orders");
    return {
      success: true as const,
      data: { ...data, details: null } as AdminRider,
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.riderRevokeFailed", err),
    };
  }
}

export async function registerRiderAction(input: RiderDetailsInput) {
  try {
    await requireAdmin();
    const details = validateRiderDetails(input);
    const admin = createServiceRoleClient();

    const { data: userList, error: listError } = await admin.auth.admin.listUsers({
      page: 1,
      perPage: 1000,
    });
    if (listError) throw listError;

    const phoneDigits = details.phone.replace(/^\+/, "");
    let userId =
      userList.users.find((u) => u.phone === phoneDigits || u.phone === details.phone)?.id ??
      null;

    if (!userId) {
      const { data: profilesMatch } = await admin
        .from("profiles")
        .select("id")
        .eq("phone", details.phone)
        .maybeSingle();
      userId = profilesMatch?.id ?? null;
    }

    if (!userId) {
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        phone: details.phone,
        email: `rider-${phoneDigits}@dev.local`,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { full_name: details.fullName },
      });
      if (createError) throw createError;
      userId = created.user?.id ?? null;
    }

    if (!userId) throw new Error(await serverT("errors.riderRegisterFailed"));

    const { data: profile, error: upsertError } = await admin
      .from("profiles")
      .upsert(
        {
          id: userId,
          phone: details.phone,
          full_name: details.fullName,
          role: "rider",
        },
        { onConflict: "id" },
      )
      .select("id, full_name, phone, created_at, role")
      .single();
    if (upsertError) throw upsertError;

    const riderDetails = await upsertRiderDetails(admin, userId, details);

    revalidatePath("/dashboard/riders");
    revalidatePath("/dashboard/orders");
    return {
      success: true as const,
      data: { ...profile, details: riderDetails } as AdminRider,
    };
  } catch (err) {
    if (err instanceof Error && err.message === "Invalid civil id") {
      return {
        success: false as const,
        error: await serverT("errors.riderCivilIdInvalid"),
      };
    }
    return {
      success: false as const,
      error: await actionErrorMessage("errors.riderRegisterFailed", err),
    };
  }
}
