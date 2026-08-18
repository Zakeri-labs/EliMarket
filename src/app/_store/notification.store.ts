import { create } from "zustand";
import type { AppNotification, NotificationType } from "@/types/notification.interface";

type NotificationState = {
  notifications: AppNotification[];
  showNotification: (input: {
    type: NotificationType;
    message: string;
    duration?: number;
  }) => void;
  dismissNotification: (id: string) => void;
};

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  showNotification: ({ type, message, duration }) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const item: AppNotification = { id, type, message, duration };
    set((state) => ({ notifications: [...state.notifications, item] }));

    const ms = duration ?? (type === "error" ? 6000 : 5000);
    if (typeof window !== "undefined" && ms > 0) {
      window.setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, ms);
    }
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
