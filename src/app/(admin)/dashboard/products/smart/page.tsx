"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Upload } from "lucide-react";
import { processSmartProductDraftAction } from "@/app/_actions/smart-product-actions";
import { createProductAction, getCategoriesAction } from "@/app/_actions/product-actions";
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
import type { SmartProductDraft } from "@/app/_actions/smart-product-actions";

const MAX_PHOTOS = 6;

const STEPS = [
  "stepPhoto",
  "stepEnhance",
  "stepContent",
  "stepReview",
  "stepPublish",
] as const;

type FeatureDraft = { label: string; value: string };

export default function SmartProductPage() {
  const { t } = useTranslations();
  const router = useRouter();
  const { runAction, isPending } = useFormAction();
  const [categories, setCategories] = useState<Category[]>([]);
  const [rawFiles, setRawFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [hintName, setHintName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [phase, setPhase] = useState<"upload" | "processing" | "review">("upload");
  const [draft, setDraft] = useState<SmartProductDraft | null>(null);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [descriptionFa, setDescriptionFa] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [features, setFeatures] = useState<FeatureDraft[]>([]);

  useEffect(() => {
    getCategoriesAction().then((result) => {
      if (result.success) setCategories(result.data);
    });
  }, []);

  useEffect(() => {
    const urls = rawFiles.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [rawFiles]);

  const activeStep =
    phase === "upload" ? 0 : phase === "processing" ? 2 : 3;

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

  const startPipeline = () => {
    if (rawFiles.length === 0) {
      notifyFormError(t("admin.smartProduct.noImages"), {
        title: t("notifications.errorTitle"),
      });
      return;
    }

    setPhase("processing");
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
        return processSmartProductDraftAction({
          imageUrls: uploaded,
          hintName: hintName.trim() || undefined,
          categoryId: categoryId || undefined,
          categoryName: category?.name,
          categories: categories.map((item) => ({ id: item.id, name: item.name })),
        });
      },
      {
        successMessage: t("notifications.smartProductReady"),
        onSuccess: (data) => {
          if (!data) {
            setPhase("upload");
            return;
          }
          setDraft(data);
          setPrimaryIndex(0);
          setName(data.name);
          setSlug(data.slug);
          setDescriptionFa(data.description_fa);
          setDescriptionAr(data.description_ar);
          setDescriptionEn(data.description_en);
          setCategoryId(data.suggestedCategoryId || categoryId);
          setFeatures(data.features.length ? data.features : []);
          setPhase("review");
        },
        onError: () => setPhase("upload"),
      },
    );
  };

  const publish = () => {
    if (!draft || !name.trim() || !slug.trim()) {
      notifyFormError(t("admin.products.validationName"), {
        title: t("notifications.errorTitle"),
      });
      return;
    }
    const primary = draft.images[primaryIndex] ?? draft.images[0];
    runAction(
      () =>
        createProductAction({
          name: name.trim(),
          slug: slug.trim(),
          description_fa: descriptionFa.trim() || null,
          description_ar: descriptionAr.trim() || null,
          description_en: descriptionEn.trim() || null,
          price,
          stock,
          category_id: categoryId || null,
          image_url: primary?.processedUrl ?? null,
          blur_hash: primary?.blurHash ?? null,
          is_active: true,
          features: features.filter((item) => item.label.trim() && item.value.trim()),
        }),
      {
        successMessage: t("notifications.productCreated"),
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
      <ol className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {STEPS.map((key, index) => (
          <li
            key={key}
            className={`rounded-xl border px-3 py-2 text-xs font-medium ${
              index <= activeStep
                ? "border-[#6b8f71] bg-[#6b8f71]/10 text-[#527559]"
                : "border-[#e4e4e7] bg-white text-[#71717a]"
            }`}
          >
            <span className="me-1">{index + 1}.</span>
            {t(`admin.smartProduct.${key}`)}
          </li>
        ))}
      </ol>

      {phase === "upload" && (
        <div className="space-y-4">
          <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-[#18181b]">
              {t("admin.smartProduct.uploadTitle")}
            </h2>
            <p className="mt-1 text-sm text-[#71717a]">{t("admin.smartProduct.uploadHint")}</p>
            <label className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#6b8f71] bg-[#f7faf7] px-4 py-10">
              <AppIcon icon={Upload} size="lg" className="text-[#6b8f71]" />
              <span className="mt-2 text-sm font-medium text-[#527559]">
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
              </label>
              <input
                value={hintName}
                onChange={(event) => setHintName(event.target.value)}
                placeholder={t("admin.smartProduct.hintNamePlaceholder")}
                className={inputClass}
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

          <Button
            className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
            disabled={isPending}
            onClick={startPipeline}
          >
            <AppIcon icon={Sparkles} size="sm" className="me-2" />
            {t("admin.smartProduct.processButton")}
          </Button>
        </div>
      )}

      {phase === "processing" && (
        <div className="rounded-2xl border border-[#e4e4e7] bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-medium text-[#527559]">{t("admin.smartProduct.processing")}</p>
          <p className="mt-2 text-sm text-[#71717a]">{t("admin.smartProduct.processingEnhance")}</p>
          <p className="mt-1 text-sm text-[#71717a]">{t("admin.smartProduct.processingContent")}</p>
        </div>
      )}

      {phase === "review" && draft && (
        <div className="space-y-4">
          {!draft.usedVisionModel && (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t("admin.smartProduct.fallbackNotice")}
            </p>
          )}

          <section className="rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">{t("admin.smartProduct.pickPrimary")}</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {draft.images.map((image, index) => (
                <button
                  key={image.processedUrl}
                  type="button"
                  onClick={() => setPrimaryIndex(index)}
                  className={`overflow-hidden rounded-2xl border p-2 text-start ${
                    primaryIndex === index ? "border-[#6b8f71] ring-2 ring-[#6b8f71]/30" : "border-[#e4e4e7]"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="mb-1 text-[11px] text-[#71717a]">{t("admin.smartProduct.before")}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.originalUrl} alt="" className="aspect-square w-full rounded-xl object-contain bg-[#f4f4f5]" />
                    </div>
                    <div>
                      <p className="mb-1 text-[11px] text-[#71717a]">{t("admin.smartProduct.after")}</p>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.processedUrl} alt="" className="aspect-square w-full rounded-xl object-contain bg-[#1a1a1a]" />
                    </div>
                  </div>
                  {primaryIndex === index && (
                    <p className="mt-2 text-xs font-medium text-[#527559]">
                      {t("admin.smartProduct.primaryBadge")}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-[#e4e4e7] bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold">{t("admin.smartProduct.reviewTitle")}</h2>
            <p className="text-sm text-[#71717a]">{t("admin.smartProduct.reviewHint")}</p>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t("admin.products.namePlaceholder")}
              className={inputClass}
            />
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder={t("admin.products.slugPlaceholder")}
              className={inputClass}
              dir="ltr"
            />
            <textarea
              value={descriptionFa}
              onChange={(event) => setDescriptionFa(event.target.value)}
              placeholder={t("admin.products.descriptionFa")}
              className={inputClass}
              rows={3}
            />
            <textarea
              value={descriptionAr}
              onChange={(event) => setDescriptionAr(event.target.value)}
              placeholder={t("admin.products.descriptionAr")}
              className={inputClass}
              rows={3}
            />
            <textarea
              value={descriptionEn}
              onChange={(event) => setDescriptionEn(event.target.value)}
              placeholder={t("admin.products.descriptionEn")}
              className={inputClass}
              rows={3}
              dir="ltr"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={price}
                onChange={(event) => setPrice(Number(event.target.value) || 0)}
                placeholder={t("admin.products.priceLabel")}
                className={inputClass}
              />
              <input
                type="number"
                value={stock}
                onChange={(event) => setStock(Number(event.target.value) || 0)}
                placeholder={t("admin.products.stockLabel")}
                className={inputClass}
              />
            </div>
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
          </section>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-[#e4e4e7] text-[#71717a]"
              onClick={() => {
                setPhase("upload");
                setDraft(null);
              }}
            >
              {t("admin.smartProduct.startOver")}
            </Button>
            <Button
              className="!bg-[#6b8f71] !text-white hover:!bg-[#527559]"
              disabled={isPending}
              onClick={publish}
            >
              {t("admin.smartProduct.publish")}
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
