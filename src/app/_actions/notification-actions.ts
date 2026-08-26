"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import type { AdminNotification } from "@/app/_types/database.types";

export async function getAdminNotificationsAction(limit = 50) {
  try {
    const { supabase, user } = await requireAdmin();
    const { data, error } = await supabase
      .from("admin_notifications")
      .select("*")
      .eq("recipient_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return { success: true as const, data: (data ?? []) as AdminNotification[] };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.notificationsLoadFailed", err),
      data: [] as AdminNotification[],
    };
  }
}

export async function markNotificationReadAction(id: string) {
  try {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("id", id)
      .eq("recipient_id", user.id)
      .is("read_at", null);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.notificationUpdateFailed", err),
    };
  }
}

export async function markAllNotificationsReadAction() {
  try {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase
      .from("admin_notifications")
      .update({ read_at: new Date().toISOString() })
      .eq("recipient_id", user.id)
      .is("read_at", null);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.notificationUpdateFailed", err),
    };
  }
}

export async function deleteNotificationAction(id: string) {
  try {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase
      .from("admin_notifications")
      .delete()
      .eq("id", id)
      .eq("recipient_id", user.id);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.notificationDeleteFailed", err),
    };
  }
}

export async function deleteReadNotificationsAction() {
  try {
    const { supabase, user } = await requireAdmin();
    const { error } = await supabase
      .from("admin_notifications")
      .delete()
      .eq("recipient_id", user.id)
      .not("read_at", "is", null);
    if (error) throw error;
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.notificationDeleteFailed", err),
    };
  }
}
