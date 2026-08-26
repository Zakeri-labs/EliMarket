"use client";

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
import { notifyFormSuccess } from "@/app/utils/form-notify";
import { useTranslations } from "@/i18n/use-translations";
import type { AdminNotification } from "@/app/_types/database.types";
import { getNumberLocale } from "@/i18n/config";

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

export function AdminNotificationBell() {
  const { t, locale } = useTranslations();
  const session = useAuthStore((s) => s.session);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
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

  const items = query.data ?? [];
  const unreadCount = useMemo(
    () => items.filter((n) => !n.read_at).length,
    [items],
  );

  const invalidate = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
    void queryClient.invalidateQueries({ queryKey: ["orders"] });
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
          if (row.type === "new_order") {
            alertNewOrder({
              orderId: row.order_id,
              title: row.title,
              body: row.body,
            });
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

  const onOpenItem = async (n: AdminNotification) => {
    if (!n.read_at) {
      await markNotificationReadAction(n.id);
      invalidate();
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#e4e4e7] bg-[#fafafa] text-[#18181b] hover:bg-[#f4f4f5]"
        aria-label={t("admin.notifCenter.title")}
        title={t("admin.notifCenter.title")}
      >
        <AppIcon icon={Bell} size="sm" />
        {unreadCount > 0 ? (
          <span className="absolute -end-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#0f766e] px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute end-0 z-50 mt-2 w-[min(100vw-2rem,22rem)] overflow-hidden rounded-xl border border-[#e4e4e7] bg-white shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-[#e4e4e7] px-3 py-2.5">
            <p className="text-sm font-semibold text-[#18181b]">{t("admin.notifCenter.title")}</p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="rounded p-1.5 text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#18181b]"
                title={t("admin.notifCenter.markAllRead")}
                onClick={async () => {
                  await markAllNotificationsReadAction();
                  invalidate();
                }}
              >
                <AppIcon icon={CheckCheck} size="xs" />
              </button>
              <button
                type="button"
                className="rounded p-1.5 text-[#71717a] hover:bg-[#f4f4f5] hover:text-[#18181b]"
                title={t("admin.notifCenter.clearRead")}
                onClick={async () => {
                  await deleteReadNotificationsAction();
                  invalidate();
                }}
              >
                <AppIcon icon={Trash2} size="xs" />
              </button>
            </div>
          </div>

          <ul className="max-h-80 overflow-y-auto">
            {query.isLoading ? (
              <li className="px-3 py-6 text-center text-sm text-[#71717a]">{t("common.loading")}</li>
            ) : !items.length ? (
              <li className="px-3 py-6 text-center text-sm text-[#71717a]">
                {t("admin.notifCenter.empty")}
              </li>
            ) : (
              items.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "border-b border-[#f4f4f5] last:border-b-0",
                    !n.read_at && "bg-[#0f766e]/5",
                  )}
                >
                  <div className="flex gap-1">
                    <Link
                      href={
                        n.order_id
                          ? `/dashboard/orders?highlight=${n.order_id}`
                          : "/dashboard/orders"
                      }
                      className="min-w-0 flex-1 px-3 py-2.5 text-start hover:bg-[#fafafa]"
                      onClick={() => void onOpenItem(n)}
                    >
                      <p className="truncate text-sm font-medium text-[#18181b]">{n.title}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-[#71717a]">{n.body}</p>
                      <p className="mt-1 text-[10px] text-[#a1a1aa]">
                        {new Date(n.created_at).toLocaleString(getNumberLocale(locale))}
                      </p>
                    </Link>
                    <button
                      type="button"
                      className="shrink-0 self-start p-2 text-[#a1a1aa] hover:text-red-500"
                      aria-label={t("common.delete")}
                      onClick={async () => {
                        await deleteNotificationAction(n.id);
                        invalidate();
                      }}
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
    </div>
  );
}
