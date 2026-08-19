import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { pushAppNotification } from "@/app/_store/notification.store";
import type { NotificationType } from "@/types/notification.interface";

function pushNotification(
  type: NotificationType,
  message: string,
  options?: { title?: string; duration?: number },
) {
  pushAppNotification({
    type,
    message,
    title: options?.title,
    duration: options?.duration ?? (type === "error" ? 6000 : 5000),
  });
}

export function notifyFormSuccess(
  message: string,
  options?: { title?: string; duration?: number },
) {
  pushNotification("success", message, options);
}

export function notifyFormWarning(
  message: unknown,
  options?: { title?: string; duration?: number; fallback?: string },
) {
  pushNotification(
    "warning",
    extractActionErrorMessage(message, options?.fallback ?? "Warning"),
    { title: options?.title, duration: options?.duration ?? 7000 },
  );
}

export function notifyFormError(
  message: unknown,
  options?: { title?: string; duration?: number; fallback?: string },
) {
  pushNotification(
    "error",
    extractActionErrorMessage(message, options?.fallback ?? "Operation failed"),
    options,
  );
}

export function notifyFormInfo(
  message: string,
  options?: { title?: string; duration?: number },
) {
  pushNotification("info", message, options);
}
