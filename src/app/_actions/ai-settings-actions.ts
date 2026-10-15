"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { invalidateAiConfigCache } from "@/lib/ai/ai-config";
import { normalizeAiSettings, type AiSettings } from "@/lib/ai/ai-config-defaults";

export async function getAiSettingsAction() {
  try {
    const { supabase } = await requireAdmin();
    const { data, error } = await supabase
      .from("ai_settings")
      .select("config")
      .eq("id", "default")
      .maybeSingle();
    if (error) throw error;
    return { success: true as const, data: normalizeAiSettings(data?.config) };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsLoadFailed", err),
    };
  }
}

export async function updateAiSettingsAction(input: AiSettings) {
  try {
    const { supabase } = await requireAdmin();
    const config = normalizeAiSettings(input);
    const { error } = await supabase
      .from("ai_settings")
      .upsert({ id: "default", config, updated_at: new Date().toISOString() });
    if (error) throw error;
    invalidateAiConfigCache();
    return { success: true as const, data: config };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.settingsUpdateFailed", err),
    };
  }
}
