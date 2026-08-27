"use client";

import { useEffect, useMemo, useRef } from "react";
import { Camera, RefreshCw } from "lucide-react";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";

/** Camera-capture field shared by the delivery / failed-delivery modals.
 *  On mobile `capture` opens the camera directly. */
export function DeliveryPhotoField({
  file,
  onChange,
  disabled,
}: {
  file: File | null;
  onChange: (file: File | null) => void;
  disabled?: boolean;
}) {
  const { t } = useTranslations();
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        disabled={disabled}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      {preview ? (
        <div className="space-y-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt=""
            className="max-h-56 w-full rounded-xl border border-[#e4e4e7] object-contain"
          />
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
              inputRef.current?.click();
            }}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#0f766e] disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            {t("rider.proof.retakePhoto")}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#0d9488]/40 bg-[#0d9488]/5 px-4 py-8 text-sm font-medium text-[#0f766e] transition-colors hover:bg-[#0d9488]/10 disabled:opacity-50",
          )}
        >
          <Camera className="h-6 w-6" />
          {t("rider.proof.takePhoto")}
        </button>
      )}
    </div>
  );
}
