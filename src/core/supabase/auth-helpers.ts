import { createClient } from "@/core/supabase/server";
import type { ClientSession } from "@/app/_types/auth.types";
import type { Profile, UserRole } from "@/app/_types/database.types";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

export async function getCurrentProfile() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return profile as Profile | null;
}

export function mapProfileToSession(
  userId: string,
  profile: Profile | null,
  phone?: string | null,
  email?: string | null,
): ClientSession {
  return {
    id: userId,
    phone: profile?.phone ?? phone ?? undefined,
    email: email ?? undefined,
    fullName: profile?.full_name ?? undefined,
    role: profile?.role,
    avatarUrl: profile?.avatar_url ?? undefined,
    avatarBlurHash: profile?.avatar_blur_hash ?? undefined,
  };
}

export async function requireAuth() {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  const profile = await getCurrentProfile();
  return { supabase, user, profile };
}

export async function requireAdmin() {
  const ctx = await requireAuth();
  if (ctx.profile?.role !== "admin") throw new Error("Forbidden");
  return ctx;
}

export async function requireRole(role: UserRole) {
  const ctx = await requireAuth();
  if (ctx.profile?.role !== role) throw new Error("Forbidden");
  return ctx;
}

/** Oman mobile numbers: 8 local digits, country code +968 (no trunk 0 prefix). */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("968") && digits.length === 11) return `+${digits}`;
  if (digits.length === 8) return `+968${digits}`;
  return phone.startsWith("+") ? phone : `+${digits}`;
}
