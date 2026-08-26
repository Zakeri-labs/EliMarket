"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/core/supabase/auth-helpers";
import { createServiceRoleClient } from "@/core/supabase/service";
import { actionErrorMessage } from "@/i18n/action-error";
import { serverT } from "@/i18n/server";
import {
  AVATAR_MAX_UPLOAD_BYTES,
  isAllowedAvatarMime,
  optimizeAvatarImage,
} from "@/lib/images/optimize-avatar";

const BUCKET = "product-images";

function avatarStoragePath(userId: string) {
  return `avatars/${userId}/avatar.webp`;
}

function extractStoragePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return decodeURIComponent(url.slice(idx + marker.length).split("?")[0] ?? "");
}

export async function updateAvatarAction(formData: FormData) {
  try {
    const { supabase, user } = await requireAuth();
    const file = formData.get("avatar");

    if (!(file instanceof File) || file.size === 0) {
      throw new Error(await serverT("errors.avatarRequired"));
    }
    if (!isAllowedAvatarMime(file.type)) {
      throw new Error(await serverT("errors.avatarInvalidType"));
    }
    if (file.size > AVATAR_MAX_UPLOAD_BYTES) {
      throw new Error(await serverT("errors.avatarTooLarge"));
    }

    const input = Buffer.from(await file.arrayBuffer());
    const { webp, blurHash } = await optimizeAvatarImage(input);

    const admin = createServiceRoleClient();
    const path = avatarStoragePath(user.id);

    const { error: uploadError } = await admin.storage.from(BUCKET).upload(path, webp, {
      upsert: true,
      contentType: "image/webp",
      cacheControl: "31536000",
    });
    if (uploadError) throw uploadError;

    const { data: publicData } = admin.storage.from(BUCKET).getPublicUrl(path);
    // Cache-bust so browsers pick up the replaced object at the same path
    const avatarUrl = `${publicData.publicUrl}?v=${Date.now()}`;

    const { data: profile, error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url: avatarUrl,
        avatar_blur_hash: blurHash,
      })
      .eq("id", user.id)
      .select("avatar_url, avatar_blur_hash")
      .single();

    if (updateError) throw updateError;

    revalidatePath("/account");
    return {
      success: true as const,
      data: {
        avatarUrl: profile.avatar_url as string,
        avatarBlurHash: (profile.avatar_blur_hash as string | null) ?? blurHash,
      },
    };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.avatarUploadFailed", err),
    };
  }
}

export async function removeAvatarAction() {
  try {
    const { supabase, user, profile } = await requireAuth();
    const admin = createServiceRoleClient();

    const path =
      extractStoragePathFromPublicUrl(profile?.avatar_url) ?? avatarStoragePath(user.id);

    await admin.storage.from(BUCKET).remove([path.replace(/\?.*$/, "")]);

    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: null, avatar_blur_hash: null })
      .eq("id", user.id);

    if (error) throw error;

    revalidatePath("/account");
    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: await actionErrorMessage("errors.avatarRemoveFailed", err),
    };
  }
}
