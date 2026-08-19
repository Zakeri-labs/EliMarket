"use client";

import { completeImageUploadAction } from "@/app/_actions/image-actions";
import { useFormAction, type ActionResult } from "@/app/hooks/use-form-action";
import {
  uploadImageFileToStorage,
  type ImageStorageFolder,
} from "@/lib/storage/upload-image-client";

/** Max direct upload size (Supabase Storage; not limited by Server Action body). */
export const MAX_IMAGE_UPLOAD_BYTES = 15 * 1024 * 1024;

type UploadOptions = {
  successMessage?: string;
  onSuccess?: (data: { url: string; blurHash: string } | undefined) => void;
  onError?: (error: string) => void;
};

export function useAdminImageUpload() {
  const { runAction, isPending } = useFormAction();

  const uploadImage = (
    file: File,
    folder: ImageStorageFolder,
    options?: UploadOptions,
  ) => {
    runAction(
      async (): Promise<ActionResult<{ url: string; blurHash: string }>> => {
        if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
          return { success: false, error: "FILE_TOO_LARGE" };
        }

        const { url } = await uploadImageFileToStorage(file, folder);
        return completeImageUploadAction(url);
      },
      options,
    );
  };

  return { uploadImage, isPending };
}
