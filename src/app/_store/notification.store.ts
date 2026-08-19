import { create } from "zustand";
import type { AppNotification, NotificationInput } from "@/types/notification.interface";

type NotificationState = {
  notifications: AppNotification[];
  showNotification: (input: NotificationInput) => string;
  addNotification: (input: NotificationInput) => string;
  removeNotification: (id: string) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function buildNotification(input: NotificationInput): AppNotification {
  return {
    id: createId(),
    duration: input.type === "error" ? 6000 : 5000,
    ...input,
  };
}

export const useNotificationStore = create<NotificationState>((set, get) => {
  const showNotification = (input: NotificationInput) => {
    const item = buildNotification(input);
    set((state) => ({ notifications: [...state.notifications, item] }));
    return item.id;
  };

  return {
    notifications: [],
    showNotification,
    addNotification: showNotification,
    removeNotification: (id) =>
      set((state) => ({
        notifications: state.notifications.filter((n) => n.id !== id),
      })),
    dismissNotification: (id) => {
      get().removeNotification(id);
    },
    clearAll: () =>
      set((state) => ({
        ...state,
        notifications: [],
      })),
  };
});

/** Stable helper for non-React call sites (form-notify, etc.). */
export function pushAppNotification(input: NotificationInput): string {
  const state = useNotificationStore.getState();
  const notify = state.showNotification ?? state.addNotification;
  if (typeof notify !== "function") {
    throw new Error("Notification store is not initialized");
  }
  return notify(input);
}
