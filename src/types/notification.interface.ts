export type NotificationType = "success" | "error" | "warning" | "info";

export type AppNotification = {
  id: string;
  type: NotificationType;
  /** Short heading (mindland-style toast title). */
  title?: string;
  message: string;
  duration?: number;
};

export type NotificationInput = Omit<AppNotification, "id">;
