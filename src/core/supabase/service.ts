import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { publicEnv } from "@/config/env";

/**
 * Service-role client — bypasses RLS. Only for server-side code that has
 * already independently verified the action it's about to perform (e.g. a
 * payment provider confirmed a charge). Never expose this to a client
 * component or return its results unfiltered to the browser.
 */
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }
  return createSupabaseClient(publicEnv.supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
