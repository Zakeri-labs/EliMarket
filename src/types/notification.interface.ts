export type NotificationType = "success" | "error" | "warning" | "info";

export type AppNotification = {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
};
