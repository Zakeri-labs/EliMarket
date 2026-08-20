"use client";

import { useEffect } from "react";
import { AlertTriangle, Check, Info, MessageSquare, X } from "lucide-react";
import { useNotificationStore } from "@/app/_store/notification.store";
import { useTranslations } from "@/i18n/use-translations";
import type { AppNotification, NotificationType } from "@/types/notification.interface";

const TYPE_TITLE: Record<NotificationType, string> = {
  error: "خطا در اجرای عملیات",
  success: "عملیات با موفقیت انجام شد",
  warning: "توجه",
  info: "اعلان",
};

const ICON_COLOR: Record<NotificationType, string> = {
  error: "#b91c1c",
  success: "#047857",
  warning: "#b45309",
  info: "#0f766e",
};

function toNotificationText(message: unknown): string {
  if (message == null) return "";
  if (typeof message === "string") return message;
  if (Array.isArray(message)) {
    return message.map((item) => toNotificationText(item)).filter(Boolean).join("\n");
  }
  if (typeof message === "object") {
    const value = message as { message?: unknown; msg?: unknown; detail?: unknown };
    if (value.message != null) return toNotificationText(value.message);
    if (value.msg != null) return toNotificationText(value.msg);
    if (value.detail != null) return toNotificationText(value.detail);
    try {
      return JSON.stringify(message);
    } catch {
      return String(message);
    }
  }
  return String(message);
}

function parseToastContent(message: unknown): { title: string; description: string } {
  const text = toNotificationText(message).trim();
  const newline = text.indexOf("\n");
  if (newline !== -1) {
    return {
      title: text.slice(0, newline).trim(),
      description: text.slice(newline + 1).trim(),
    };
  }
  const pipe = text.indexOf("|");
  if (pipe !== -1) {
    return {
      title: text.slice(0, pipe).trim(),
      description: text.slice(pipe + 1).trim(),
    };
  }
  return { title: "", description: text };
}

function resolveDisplay(
  notification: AppNotification,
  fallbackTitle: string,
): { title: string; description: string } {
  const explicitTitle = notification.title?.trim() ?? "";
  const explicitMessage = toNotificationText(notification.message).trim();

  if (explicitTitle && explicitMessage) {
    return { title: explicitTitle, description: explicitMessage };
  }

  const single = explicitMessage || explicitTitle;
  const parsed = parseToastContent(single);
  return {
    title: parsed.title || single || fallbackTitle,
    description: parsed.title ? parsed.description : "",
  };
}

function TypeIcon({ type }: { type: NotificationType }) {
  const cls = "h-4 w-4 shrink-0";
  switch (type) {
    case "success":
      return <Check className={cls} strokeWidth={2.25} aria-hidden />;
    case "error":
      return <MessageSquare className={cls} strokeWidth={2.25} aria-hidden />;
    case "warning":
      return <AlertTriangle className={cls} strokeWidth={2.25} aria-hidden />;
    default:
      return <Info className={cls} strokeWidth={2.25} aria-hidden />;
  }
}

export function NotificationToast({ notification }: { notification: AppNotification }) {
  const dismissNotification = useNotificationStore((s) => s.dismissNotification);
  const { t, dir } = useTranslations();

  const fallbackTitle = {
    success: t("notifications.successTitle"),
    error: t("notifications.errorTitle"),
    warning: t("notifications.warningTitle"),
    info: t("notifications.infoTitle"),
  }[notification.type] || TYPE_TITLE[notification.type];

  const { title, description } = resolveDisplay(notification, fallbackTitle);

  useEffect(() => {
    const duration = Math.max(800, notification.duration ?? 5000);
    const timer = window.setTimeout(() => dismissNotification(notification.id), duration);
    return () => window.clearTimeout(timer);
  }, [notification.id, notification.duration, dismissNotification]);

  return (
    <div
      role={notification.type === "error" ? "alert" : "status"}
      aria-atomic="true"
      dir={dir}
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        width: "100%",
        boxSizing: "border-box",
        padding: 12,
        borderRadius: 12,
        background:
          "linear-gradient(135deg, rgba(45, 212, 191, 0.88), rgba(20, 184, 166, 0.82))",
        border: "1px solid rgba(13, 148, 136, 0.55)",
        boxShadow:
          "0 10px 28px rgba(13, 148, 136, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.55)",
        backdropFilter: "blur(18px) saturate(1.6)",
        WebkitBackdropFilter: "blur(18px) saturate(1.6)",
        color: "#18181b",
      }}
    >
      <div
        aria-hidden
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 36,
          height: 36,
          flexShrink: 0,
          borderRadius: 8,
          background: "rgba(255, 255, 255, 0.72)",
          color: ICON_COLOR[notification.type],
          boxShadow: "inset 0 0 0 1px rgba(15, 23, 42, 0.08)",
        }}
      >
        <TypeIcon type={notification.type} />
      </div>

      <div style={{ flex: 1, minWidth: 0, textAlign: dir === "rtl" ? "right" : "left" }}>
        <div style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.35, color: "#18181b" }}>
          {title}
        </div>
        {description ? (
          <div style={{ marginTop: 4, fontSize: 12, lineHeight: 1.5, color: "#27272a" }}>
            {description}
          </div>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => dismissNotification(notification.id)}
        aria-label={t("cart.close")}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 32,
          height: 32,
          flexShrink: 0,
          border: "none",
          borderRadius: 8,
          background: "transparent",
          color: "#18181b",
          cursor: "pointer",
        }}
      >
        <X className="h-4 w-4" strokeWidth={2} aria-hidden />
      </button>
    </div>
  );
}
