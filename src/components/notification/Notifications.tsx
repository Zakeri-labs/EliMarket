"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useNotificationStore } from "@/app/_store/notification.store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import type { AppNotification } from "@/types/notification.interface";

const TYPE_ICON: Record<AppNotification["type"], string> = {
  success: "✅",
  error: "❌",
  warning: "⚠️",
  info: "ℹ️",
};

const TYPE_ACCENT: Record<AppNotification["type"], string> = {
  success: "border-s-emerald-500",
  error: "border-s-red-500",
  warning: "border-s-amber-500",
  info: "border-s-blue-500",
};

function NotificationItem({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: (id: string) => void;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setIsVisible(true), 10);
    const duration = notification.duration ?? (notification.type === "error" ? 6000 : 5000);

    const closeTimer = window.setTimeout(() => {
      setIsVisible(false);
      window.setTimeout(() => onClose(notification.id), 300);
    }, duration);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(closeTimer);
    };
  }, [notification, onClose]);

  const dismiss = () => {
    setIsVisible(false);
    window.setTimeout(() => onClose(notification.id), 300);
  };

  return (
    <div
      className={cn(
        "w-full max-w-sm transform border-s-4 transition-all duration-300 ease-in-out",
        "rounded-lg border border-black/10 bg-white p-4 text-black shadow-lg backdrop-blur-sm",
        TYPE_ACCENT[notification.type],
        isVisible
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0 rtl:-translate-x-full",
      )}
    >
      <div className="flex items-start gap-3">
        <span className="shrink-0 text-xl leading-none" aria-hidden>
          {TYPE_ICON[notification.type]}
        </span>
        <div className="min-w-0 flex-1">
          {notification.title ? (
            <h4 className="mb-1 text-sm font-semibold">{notification.title}</h4>
          ) : null}
          <p className="text-sm leading-relaxed opacity-90">{notification.message}</p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 text-black/45 transition-colors hover:text-black"
          aria-label="Dismiss"
        >
          <AppIcon icon={X} size="xs" />
        </button>
      </div>
    </div>
  );
}

export function Notifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed top-0 end-0 z-[9998] p-4">
      <div className="flex flex-col gap-2">
        {notifications.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <NotificationItem notification={n} onClose={dismiss} />
          </div>
        ))}
      </div>
    </div>
  );
}
