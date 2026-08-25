"use client";

import { useCallback, useRef, useState } from "react";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { notifyFormError, notifyFormSuccess } from "@/app/utils/form-notify";
import { useTranslations } from "@/i18n/use-translations";

export type ActionResult<T = unknown> = {
  success: boolean;
  error?: string;
  data?: T;
};

type RunActionOptions<T> = {
  successMessage?: string;
  errorMessage?: string;
  onSuccess?: (data: T | undefined) => void;
  onError?: (error: string) => void;
  onSettled?: () => void;
};

const MIN_PENDING_MS = 500;

/** Shared form pattern: loading stays true until the DB action finishes. */
export function useFormAction() {
  const [isPending, setIsPending] = useState(false);
  const pendingLock = useRef(false);
  const { t } = useTranslations();

  const notifyError = useCallback((message: unknown) => {
    notifyFormError(message, {
      fallback: t("errors.operationFailed"),
      title: t("notifications.errorTitle"),
    });
  }, [t]);

  const notifySuccess = useCallback((message: unknown) => {
    notifyFormSuccess(
      typeof message === "string"
        ? message
        : extractActionErrorMessage(message, t("errors.done")),
      { title: t("notifications.successTitle") },
    );
  }, [t]);

  const runAction = useCallback(
    <T,>(
      action: () => Promise<ActionResult<T>>,
      options?: RunActionOptions<T>,
    ) => {
      if (pendingLock.current) return;
      pendingLock.current = true;
      setIsPending(true);
      const startedAt = Date.now();
      void (async () => {
        try {
          const result = await action();
          if (result.success) {
            if (options?.successMessage) notifySuccess(options.successMessage);
            options?.onSuccess?.(result.data);
          } else {
            const msg = extractActionErrorMessage(
              result.error,
              options?.errorMessage || t("errors.operationFailed"),
            );
            notifyError(msg);
            options?.onError?.(msg);
          }
        } catch (err) {
          const isNetworkError =
            err instanceof TypeError && /fetch/i.test(err.message);
          const msg = isNetworkError
            ? t("errors.networkError")
            : err instanceof Error
              ? err.message
              : t("errors.unexpectedError");
          notifyError(msg);
          options?.onError?.(msg);
        } finally {
          const wait = MIN_PENDING_MS - (Date.now() - startedAt);
          if (wait > 0) {
            await new Promise((resolve) => setTimeout(resolve, wait));
          }
          pendingLock.current = false;
          setIsPending(false);
          options?.onSettled?.();
        }
      })();
    },
    [notifyError, notifySuccess, t],
  );

  return {
    isPending,
    runAction,
    notifyError,
    notifySuccess,
  };
}
