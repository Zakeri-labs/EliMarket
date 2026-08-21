"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useLocaleStore } from "@/app/_store/locale-store";
import { useNotificationStore } from "@/app/_store/notification.store";
import { NotificationToast } from "@/components/notification/NotificationToast";

export function Notifications() {
  const [mounted, setMounted] = useState(false);
  const locale = useLocaleStore((s) => s.locale);
  const notifications = useNotificationStore((s) => s.notifications);
  const isEnglish = locale === "en";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || notifications.length === 0) return null;

  return createPortal(
    <div
      aria-live="polite"
      aria-relevant="additions text"
      style={{
        position: "fixed",
        zIndex: 200000,
        bottom: 24,
        left: isEnglish ? "auto" : 16,
        right: isEnglish ? 16 : "auto",
        width: 320,
        maxWidth: "calc(100vw - 32px)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        pointerEvents: "none",
      }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} style={{ pointerEvents: "auto", width: "100%" }}>
          <NotificationToast notification={notification} />
        </div>
      ))}
    </div>,
    document.body,
  );
}
