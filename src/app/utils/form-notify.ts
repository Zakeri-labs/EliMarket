import { extractActionErrorMessage } from "@/app/_actions/extract-action-error";
import { useNotificationStore } from "@/app/_store/notification.store";
import type { NotificationType } from "@/types/notification.interface";

function pushNotification(
  type: NotificationType,
  message: string,
  duration?: number,
) {
  useNotificationStore.getState().showNotification({
    type,
    message,
    duration: duration ?? (type === "error" ? 6000 : 5000),
  });
}

export function notifyFormSuccess(message: string, duration?: number) {
  pushNotification("success", message, duration);
}

export function notifyFormWarning(message: unknown, duration?: number) {
  pushNotification(
    "warning",
    extractActionErrorMessage(message, "Warning"),
    duration ?? 7000,
  );
}

export function notifyFormError(message: unknown, duration?: number) {
  pushNotification(
    "error",
    extractActionErrorMessage(message, "Operation failed"),
    duration,
  );
}
