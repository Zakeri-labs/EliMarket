"use client";

import { X } from "lucide-react";
import { useNotificationStore } from "@/app/_store/notification.store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";

export function Notifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed left-4 right-4 top-4 z-[100] mx-auto flex max-w-7xl flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "pointer-events-auto rounded-2xl border px-4 py-3 text-sm shadow-lg backdrop-blur-md",
            n.type === "success" && "border-success/30 bg-success/15 text-success",
            n.type === "error" && "border-danger/30 bg-danger/15 text-danger",
            n.type === "warning" && "border-amber-500/30 bg-amber-500/15 text-amber-200",
            n.type === "info" && "border-border bg-surface/95 text-foreground",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-wrap">{n.message}</p>
            <button
              type="button"
              className="shrink-0 text-xs opacity-60 hover:opacity-100"
              onClick={() => dismiss(n.id)}
            >
              <AppIcon icon={X} size="xs" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
