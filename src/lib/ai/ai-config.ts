import { createServiceRoleClient } from "@/core/supabase/service";
import {
  DEFAULT_AI_SETTINGS,
  normalizeAiSettings,
  type AiSettings,
} from "@/lib/ai/ai-config-defaults";

/**
 * Central cost controls for every PAID AI call in the app.
 *
 * The values are managed by the admin in Dashboard → Settings → AI (stored in
 * the `ai_settings` table), not in environment variables. API keys remain in
 * the server environment because they are secrets.
 */

const CACHE_MS = 15_000;
let cache: { at: number; value: AiSettings } | null = null;

/** Drop the cached settings so the next call re-reads the database. */
export function invalidateAiConfigCache() {
  cache = null;
}

/** Current AI settings (cached briefly). Falls back to the cheap defaults. */
export async function getAiConfig(): Promise<AiSettings> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.value;
  let value = DEFAULT_AI_SETTINGS;
  try {
    const { data } = await createServiceRoleClient()
      .from("ai_settings")
      .select("config")
      .eq("id", "default")
      .maybeSingle();
    if (data?.config) value = normalizeAiSettings(data.config);
  } catch {
    // Missing table / key → keep the safe defaults.
  }
  cache = { at: Date.now(), value };
  return value;
}
