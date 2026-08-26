"use client";

import { useRef } from "react";
import { Camera, Trash2, User } from "lucide-react";
import {
  removeAvatarAction,
  updateAvatarAction,
} from "@/app/_actions/profile-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { useFormAction } from "@/app/hooks/use-form-action";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { StorefrontImage } from "@/components/ui/StorefrontImage";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
};

export function AccountAvatarEditor({ className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { session, updateSession } = useAuthStore();
  const { runAction, isPending } = useFormAction();
  const { t } = useTranslations();

  const avatarUrl = session?.avatarUrl;
  const blurHash = session?.avatarBlurHash;

  const onFileChange = (file: File | undefined) => {
    if (!file) return;
    const formData = new FormData();
    formData.set("avatar", file);
    runAction(() => updateAvatarAction(formData), {
      successMessage: t("notifications.avatarUpdated"),
      onSuccess: async () => {
        await updateSession();
        if (inputRef.current) inputRef.current.value = "";
      },
    });
  };

  const onRemove = () => {
    runAction(() => removeAvatarAction(), {
      successMessage: t("notifications.avatarRemoved"),
      onSuccess: async () => {
        await updateSession();
      },
    });
  };

  return (
    <div className={cn("flex shrink-0 flex-col items-start gap-2", className)}>
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-accent/20 md:h-20 md:w-20",
          "ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          isPending && "opacity-60",
        )}
        aria-label={t("account.changeAvatar")}
        title={t("account.changeAvatar")}
      >
        {avatarUrl ? (
          <StorefrontImage
            src={avatarUrl}
            blurHash={blurHash}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        ) : (
          <AppIcon icon={User} size="lg" className="text-accent" />
        )}
        <span className="absolute inset-x-0 bottom-0 flex items-center justify-center bg-black/55 py-1">
          <AppIcon icon={Camera} size="xs" className="text-white" />
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        className="sr-only"
        onChange={(e) => onFileChange(e.target.files?.[0])}
      />

      <div className="hidden flex-wrap items-center gap-2 md:flex">
        <button
          type="button"
          disabled={isPending}
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-accent"
        >
          {isPending ? t("common.uploading") : t("account.changeAvatar")}
        </button>
        {avatarUrl ? (
          <button
            type="button"
            disabled={isPending}
            onClick={onRemove}
            className="inline-flex items-center gap-1 text-sm text-danger"
          >
            <AppIcon icon={Trash2} size="xs" />
            {t("account.removeAvatar")}
          </button>
        ) : null}
      </div>
      <p className="hidden text-xs text-muted md:block">{t("account.avatarHint")}</p>
    </div>
  );
}
