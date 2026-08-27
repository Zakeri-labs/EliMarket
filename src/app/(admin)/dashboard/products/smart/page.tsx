"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload } from "lucide-react";
import { createQueuedSmartProductAction } from "@/app/_actions/smart-product-actions";
import { getCategoriesAction } from "@/app/_actions/product-actions";
import { completeImageUploadAction } from "@/app/_actions/image-actions";
import { useFormAction } from "@/app/hooks/use-form-action";
import { MAX_IMAGE_UPLOAD_BYTES } from "@/app/hooks/use-admin-image-upload";
import { notifyFormError } from "@/app/utils/form-notify";
import { uploadImageFileToStorage } from "@/lib/storage/upload-image-client";
import { AdminShell } from "@/app/(admin)/_components/AdminShell";
import { Button } from "@/components/ui/Button";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";
import type { Category } from "@/app/_types/database.types";

const MAX_PHOTOS = 6;

export default function SmartProductPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { runAction, isPending } = useFormAction();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hintName, setHintName] = useState("");
  const [categoryId, setCategoryId] = useState("");

  useEffect(() => {
    getCategoriesAction().then((result) => {
      if (result.success) setCategories(result.data);
    });
  }, []);

  useEffect(() => {
    // Genuine external-system sync (object URLs need cleanup), not derived
    // state — can't move this to render or it'd leak a URL every re-render.
    const urls = rawFiles.map((file) => URL.createObjectURL(file));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [rawFiles]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...rawFiles];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_PHOTOS) break;
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
        notifyFormError(t("errors.fileTooLarge"), { title: t("notifications.errorTitle") });
        continue;
      }
      next.push(file);
    }
    setRawFiles(next);
  };

  const queueGeneration = () => {
    if (!hintName.trim()) {
      notifyFormError(t("admin.smartProduct.nameRequired"), {
        title: t("notifications.errorTitle"),
      });
      return;
    }
    if (rawFiles.length === 0) {
      notifyFormError(t("admin.smartProduct.noImages"), {
        title: t("notifications.errorTitle"),
      });
      return;
    }

    runAction(
      async () => {
        const uploaded: string[] = [];
        for (const file of rawFiles) {
          const { url } = await uploadImageFileToStorage(file, "products");
          const completed = await completeImageUploadAction(url);
          if (!completed.success || !completed.data?.url) {
            return { success: false as const, error: completed.error };
          }
          uploaded.push(completed.data.url);
        }
        const category = categories.find((item) => item.id === categoryId);
        return createQueuedSmartProductAction({
          imageUrls: uploaded,
          hintName: hintName.trim(),
          categoryId: categoryId || undefined,
          categoryName: category?.name,
          categories: categories.map((item) => ({ id: item.id, name: item.name })),
        });
      },
      {
        successMessage: t("admin.smartProduct.queued"),
        onSuccess: () => router.push("/dashboard/products"),
      },
    );
  };

  const inputClass = "w-full rounded-xl border border-[#e4e4e7] px-3 py-2.5 text-sm";

  return (
    <AdminShell
      title={t("admin.smartProduct.title")}
      subtitle={t("admin.smartProduct.subtitle")}
    >
      <div className="space-y-4">
        <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-[#18181b]">
            {t("admin.smartProduct.uploadTitle")}
          </h2>
          <p className="mt-1 text-sm text-[#71717a]">{t("admin.smartProduct.uploadHint")}</p>
          <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#0d9488] bg-[#f7faf7] px-4 py-10">
            <AppIcon icon={Upload} size="lg" className="text-[#0d9488]" />
            <span className="mt-2 text-sm font-medium text-[#0f766e]">
              {t("admin.smartProduct.uploadButton")}
            </span>
            <span className="mt-1 text-xs text-[#71717a]">
              {t("admin.smartProduct.maxPhotos", { count: MAX_PHOTOS })}
            </span>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              multiple
              className="hidden"
              onChange={(event) => {
                addFiles(event.target.files);
                event.target.value = "";
              }}
            />
          </label>
          {previews.length > 0 && (
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {previews.map((src, index) => (
                <li key={`${rawFiles[index]?.name}-${index}`} className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt=""
                    className="aspect-square w-full rounded-xl object-cover"
                  />
                  <button
                    type="button"
                    className="absolute end-2 top-2 rounded-lg bg-white/90 px-2 py-1 text-[11px] text-red-600"
                    onClick={() =>
                      setRawFiles((current) => current.filter((_, i) => i !== index))
                    }
                  >
                    {t("admin.smartProduct.removePhoto")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="grid gap-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs text-[#71717a]">
              {t("admin.smartProduct.hintName")}
              <span className="text-red-600"> *</span>
            </label>
            <input
              value={hintName}
              onChange={(event) => setHintName(event.target.value)}
              placeholder={t("admin.smartProduct.hintNamePlaceholder")}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#71717a]">
              {t("admin.smartProduct.categoryOptional")}
            </label>
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className={inputClass}
            >
              <option value="">{t("admin.products.noCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </section>

        <p className="text-xs text-[#71717a]">{t("admin.smartProduct.queueHint")}</p>

        <Button
          loading={isPending}
          loadingLabel={t("admin.smartProduct.queuing")}
          onClick={queueGeneration}
        >
          <AppIcon icon={Sparkles} size="sm" className="me-2" />
          {t("admin.smartProduct.processButton")}
        </Button>
      </div>
    </AdminShell>
  );
}
