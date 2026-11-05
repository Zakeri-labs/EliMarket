"use server";

import { requireAdmin } from "@/core/supabase/auth-helpers";
import { actionErrorMessage } from "@/i18n/action-error";
import { generateBlurHashFromBuffer } from "@/lib/images/generate-blur-hash";

/** After client-side storage upload, generate BlurHash from the public URL (tiny request body). */
export async function completeImageUploadAction(publicUrl: string) {
  try {
    await requireAdmin();

    // Only our own storage: the server must not fetch an address the request chose.
    if (new URL(publicUrl).origin !== new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin) {
      throw new Error("Unexpected image address");
    }

    const res = await fetch(publicUrl, { cache: "no-store" });
    if (!res.ok) {
      throw new Error(`Failed to read uploaded image (${res.status})`);
    }

    const buffer = Buffer.from(await res.arrayBuffer());
    const blurHash = await generateBlurHashFromBuffer(buffer);

    return {
      success: true as const,
      data: { url: publicUrl, blurHash },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.imageUploadFailed", err),
    };
  }
}
