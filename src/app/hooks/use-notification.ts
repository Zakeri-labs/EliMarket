"use client";

import { useCallback } from "react";
import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { pushAppNotification, useNotificationStore } from "@/app/_store/notification.store";
import { useTranslations } from "@/i18n/use-translations";

/**
 * Mindland-style notification API: showSuccess(message, title?), handleApiError, etc.
 * Works anywhere in the app (Zustand — no provider wrapper required).
 */
export function useNotification() {
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);
  const clearAll = useNotificationStore((s) => s.clearAll);
  const { t } = useTranslations();

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      pushAppNotification({
        type: "success",
        message,
        title: title ?? t("notifications.successTitle"),
      });
    },
    [t],
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      pushAppNotification({
        type: "error",
        message,
        title: title ?? t("notifications.errorTitle"),
      });
    },
    [t],
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      pushAppNotification({
        type: "info",
        message,
        title: title ?? t("notifications.infoTitle"),
      });
    },
    [t],
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      pushAppNotification({
        type: "warning",
        message,
        title: title ?? t("notifications.warningTitle"),
      });
    },
    [t],
  );

  const handleApiError = useCallback(
    (error: unknown, fallback?: string) => {
      showError(
        extractActionErrorMessage(error, fallback ?? t("errors.operationFailed")),
        t("notifications.errorTitle"),
      );
    },
    [showError, t],
  );

  return {
    showSuccess,
    showError,
    showInfo,
    showWarning,
    handleApiError,
    dismissNotification,
    clearAll,
  };
}

/** Alias matching mindland hook name. */
export const useApiNotification = useNotification;
