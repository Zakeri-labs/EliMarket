"use client";

import { useCallback, useTransition } from "react";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { notifyFormError, notifyFormSuccess } from "@/app/utils/form-notify";

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

/** Shared form pattern: startTransition + loading + notification */
export function useFormAction() {
  const [isPending, startTransition] = useTransition();

  const notifyError = useCallback((message: unknown) => {
    notifyFormError(message);
  }, []);

  const notifySuccess = useCallback((message: unknown) => {
    notifyFormSuccess(
      typeof message === "string"
        ? message
        : extractActionErrorMessage(message, "Done"),
    );
  }, []);

  const runAction = useCallback(
    <T,>(
      action: () => Promise<ActionResult<T>>,
      options?: RunActionOptions<T>,
    ) => {
      startTransition(async () => {
        try {
          const result = await action();
          if (result.success) {
            if (options?.successMessage) notifySuccess(options.successMessage);
            options?.onSuccess?.(result.data);
          } else {
            const msg = extractActionErrorMessage(
              result.error,
              options?.errorMessage || "Operation failed",
            );
            notifyError(msg);
            options?.onError?.(msg);
          }
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Unexpected error";
          notifyError(msg);
          options?.onError?.(msg);
        } finally {
          options?.onSettled?.();
        }
      });
    },
    [notifyError, notifySuccess],
  );

  return {
    isPending,
    startTransition,
    runAction,
    notifyError,
    notifySuccess,
  };
}
