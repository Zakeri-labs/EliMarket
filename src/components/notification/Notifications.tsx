"use client";

import { useNotificationStore } from "@/app/_store/notification.store";
import { cn } from "@/app/utils/cn";

export function Notifications() {
  const notifications = useNotificationStore((s) => s.notifications);
  const dismiss = useNotificationStore((s) => s.dismissNotification);

  if (notifications.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-50 flex w-full max-w-sm flex-col gap-2">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={cn(
            "pointer-events-auto rounded-md border px-4 py-3 text-sm shadow-sm",
            n.type === "success" && "border-emerald-200 bg-emerald-50 text-emerald-900",
            n.type === "error" && "border-red-200 bg-red-50 text-red-900",
            n.type === "warning" && "border-amber-200 bg-amber-50 text-amber-900",
            n.type === "info" && "border-zinc-200 bg-white text-zinc-900",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <p className="whitespace-pre-wrap">{n.message}</p>
            <button
              type="button"
              className="text-xs opacity-60 hover:opacity-100"
              onClick={() => dismiss(n.id)}
            >
              Close
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
