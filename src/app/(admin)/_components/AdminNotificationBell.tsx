"use client";

import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notifyFormError, notifyFormSuccess } from "@/app/utils/form-notify";
import { formatOmanDateTime } from "@/config/oman-time";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import {
  deleteNotificationAction,
  deleteReadNotificationsAction,
  getAdminNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/_actions/notification-actions";
import { useAuthStore } from "@/app/_store/auth-store";
import { createClient } from "@/core/supabase/client";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";
import type { AdminNotification } from "@/app/_types/database.types";

function playNewOrderSound() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gain.gain.value = 0.04;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
    osc.stop(ctx.currentTime + 0.4);
    window.setTimeout(() => void ctx.close(), 500);
  } catch {
    /* ignore autoplay restrictions */
  }
}

// Stored rows hold one language; known types are shown in the admin's own.
function notificationText(n: AdminNotification, t: (key: string, params?: Record<string, string | number>) => string) {
  if (n.type === "new_order" && n.order_id) {
    const total = n.body?.match(/Total:\s*(.+)$/)?.[1];
    return {
      title: t("adminUi.notifNewOrder", { id: n.order_id.replace(/-/g, "").slice(0, 8).toUpperCase() }),
      body: total ? t("adminUi.notifNewOrderBody", { total }) : n.body,
    };
  }
  if (n.type === "product_generated") {
    const name = n.title.split(": ").slice(1).join(": ");
    return {
      title: t("adminUi.notifProductReady", { name }),
      body: t(n.body?.includes("AI") ? "adminUi.notifProductReview" : "adminUi.notifProductReadyBody"),
    };
  }
  if (n.type === "product_generation_failed") {
    const name = n.title.match(/«(.+)»/)?.[1];
    if (name) return { title: t("adminUi.notifProductFailed", { name }), body: n.body };
  }
  return { title: n.title, body: n.body };
}

export function AdminNotificationBell() {
  const { t, locale } = useTranslations();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const alertedOrdersRef = useRef<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: async () => {
      const result = await getAdminNotificationsAction();
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    enabled: Boolean(session?.id),
    refetchInterval: 12_000,
  });

  const items = useMemo(() => query.data ?? [], [query.data]);
  const unreadCount = useMemo(
    () => items.filter((n) => !n.read_at).length,
    [items],
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-products"] });
  }, [queryClient]);

  const alertNewOrder = useCallback(
    (opts: { orderId?: string | null; title: string; body: string }) => {
      const key = opts.orderId || `${opts.title}:${opts.body}`;
      if (alertedOrdersRef.current.has(key)) return;
      alertedOrdersRef.current.add(key);
      // Bound memory for long-lived admin sessions
      if (alertedOrdersRef.current.size > 200) {
        alertedOrdersRef.current = new Set(
          [...alertedOrdersRef.current].slice(-100),
        );
      }
      invalidate();
      playNewOrderSound();
      notifyFormSuccess(opts.body || opts.title, {
        title: t("admin.notifCenter.newOrderToast"),
      });
      if (typeof window !== "undefined" && "Notification" in window) {
        if (Notification.permission === "granted") {
          try {
            new Notification(opts.title, { body: opts.body });
          } catch {
            /* ignore */
          }
        } else if (Notification.permission === "default") {
          void Notification.requestPermission();
        }
      }
    },
    [invalidate, t],
  );

  useEffect(() => {
    if (!session?.id) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`admin-live-${session.id}-${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "admin_notifications",
          filter: `recipient_id=eq.${session.id}`,
        },
        (payload: { new: AdminNotification }) => {
          const row = payload.new;
          const text = notificationText(row, t);
          if (row.type === "new_order") {
            alertNewOrder({
              orderId: row.order_id,
              title: text.title,
              body: text.body,
            });
          } else if (row.type === "product_generated") {
            invalidate();
            notifyFormSuccess(text.body || text.title, { title: text.title });
          } else if (row.type === "product_generation_failed") {
            invalidate();
            notifyFormError(text.body || text.title, { title: text.title });
          } else {
            invalidate();
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "admin_notifications",
          filter: `recipient_id=eq.${session.id}`,
        },
        (payload: { eventType?: string }) => {
          if (payload.eventType === "INSERT") return;
          invalidate();
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: { new: { id?: string; total?: number; currency?: string } }) => {
          const order = payload.new;
          if (!order?.id) return;
          const currency = order.currency || "OMR";
          alertNewOrder({
            orderId: order.id,
            title: t("admin.notifCenter.newOrderToast"),
            body: `${t("admin.orders.orderPrefix")} ${String(order.id).slice(0, 8)}… — ${order.total ?? ""} ${currency}`,
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [session?.id, alertNewOrder, invalidate, t]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    return () => document.removeEventListener("mousedown", onPointer);
  }, [open]);

  const attempt = async (action: () => Promise<{ success: boolean }>) => {
    try {
      const result = await action();
      if (!result.success) throw new Error();
      invalidate();
    } catch {
      notifyFormError(t("adminUi.actionFailed"));
    }
  };

  const onOpenItem = async (n: AdminNotification) => {
    setOpen(false);
    if (!n.read_at) await attempt(() => markNotificationReadAction(n.id));
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex size-11 items-center justify-center rounded-full bg-background text-foreground transition-colors hover:bg-accent/10 md:size-10"
        aria-label={t("admin.notifCenter.title")}
        aria-expanded={open}
        title={t("admin.notifCenter.title")}
      >
        <AppIcon icon={Bell} size="sm" />
        {unreadCount > 0 ? (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-xs font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden admin-card shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
            <p className="text-sm font-semibold text-foreground">{t("admin.notifCenter.title")}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl text-muted hover:bg-accent/10 hover:text-accent-dark md:size-8"
                title={t("admin.notifCenter.markAllRead")}
                aria-label={t("admin.notifCenter.markAllRead")}
                onClick={() => void attempt(markAllNotificationsReadAction)}
              >
                <AppIcon icon={CheckCheck} size="xs" />
              </button>
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl text-muted hover:bg-accent/10 hover:text-accent-dark md:size-8"
                title={t("admin.notifCenter.clearRead")}
                aria-label={t("admin.notifCenter.clearRead")}
                onClick={() => setConfirmClear(true)}
              >
                <AppIcon icon={Trash2} size="xs" />
              </button>
            </div>
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {query.isLoading ? (
              <li className="px-3 py-6 text-center text-sm text-muted">{t("common.loading")}</li>
            ) : !items.length ? (
              <li className="px-3 py-6 text-center text-sm text-muted">
                {t("admin.notifCenter.empty")}
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    !n.read_at && "bg-background",
                  )}
                >
                  <div className="flex gap-1">
                    <Link
                      href={
                        n.order_id
                          ? `/dashboard/orders?highlight=${n.order_id}`
                          : n.product_id
                            ? "/dashboard/products"
                            : "/dashboard/orders"
                      }
                      className="min-w-0 flex-1 px-3 py-2.5 text-start hover:bg-background"
                      onClick={() => void onOpenItem(n)}
                    >
                      <p className="truncate text-sm font-medium text-foreground" dir="auto">
                        {notificationText(n, t).title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted" dir="auto">
                        {notificationText(n, t).body}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatOmanDateTime(n.created_at, locale)}
                      </p>
                    </Link>
                    <button
                      type="button"
                      className="grid size-11 shrink-0 place-items-center self-start rounded-xl text-muted hover:text-red-700 md:size-8"
                      aria-label={t("common.delete")}
                      onClick={() => void attempt(() => deleteNotificationAction(n.id))}
                    >
                      <AppIcon icon={Trash2} size="xs" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}
      <ConfirmDialog
        open={confirmClear}
        title={t("admin.notifCenter.clearRead")}
        description={t("adminUi.clearReadBody")}
        confirmLabel={t("common.delete")}
        cancelLabel={t("common.cancel")}
        onOpenChange={setConfirmClear}
        onConfirm={() => {
          setConfirmClear(false);
          void attempt(deleteReadNotificationsAction);
        }}
      />
    </div>
  );
}
