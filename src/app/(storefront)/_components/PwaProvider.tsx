"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Download, Share, X } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "elimarket-pwa-dismissed";
const DISMISS_AT_KEY = "elimarket-pwa-dismissed-at";
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

function isStandaloneDisplay() {
  if (typeof window === "undefined") return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    Boolean(nav.standalone)
  );
}

function isIosDevice() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
}

function wasDismissedRecently() {
  try {
    if (window.localStorage.getItem(DISMISS_KEY) === "1") {
      const at = Number(window.localStorage.getItem(DISMISS_AT_KEY) || "0");
      if (!at || Date.now() - at < DISMISS_COOLDOWN_MS) return true;
      window.localStorage.removeItem(DISMISS_KEY);
      window.localStorage.removeItem(DISMISS_AT_KEY);
    }
  } catch {
    /* ignore */
  }
  return false;
}

function markDismissed() {
  try {
    window.localStorage.setItem(DISMISS_KEY, "1");
    window.localStorage.setItem(DISMISS_AT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function PwaProvider() {
  const { t } = useTranslations();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      // no-op
    } else if (process.env.NODE_ENV === "production") {
      void navigator.serviceWorker.register("/sw.js");
    } else {
      void navigator.serviceWorker.getRegistrations().then((regs) => {
        for (const reg of regs) void reg.unregister();
      });
      if ("caches" in window) {
        void caches.keys().then((keys) => {
          for (const key of keys) void caches.delete(key);
        });
      }
    }

    if (isStandaloneDisplay() || wasDismissedRecently()) return;

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setIosHint(false);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);

    const timer = window.setTimeout(() => {
      if (isStandaloneDisplay() || wasDismissedRecently()) return;
      setIosHint(isIosDevice());
      setVisible(true);
    }, 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.clearTimeout(timer);
    };
  }, []);

  if (!visible) return null;

  const canNativeInstall = Boolean(deferred);

  return (
    <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-[55] rounded-2xl border border-border bg-surface p-4 shadow-xl lg:bottom-6 lg:max-w-sm lg:start-auto lg:end-6">
      <div className="flex items-start gap-3">
        <div className="relative mt-0.5 h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-border-subtle bg-bg-main">
          <Image src="/icon-192.png" alt="" width={48} height={48} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{t("pwa.installTitle")}</p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            {iosHint && !canNativeInstall ? t("pwa.iosHint") : t("pwa.installDesc")}
          </p>
          {iosHint && !canNativeInstall ? (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
              <AppIcon icon={Share} size="xs" className="text-accent" />
              {t("pwa.iosShare")}
            </p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {canNativeInstall ? (
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  await deferred!.prompt();
                  markDismissed();
                  setVisible(false);
                  setDeferred(null);
                }}
              >
                <AppIcon icon={Download} size="sm" />
                {t("pwa.install")}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={canNativeInstall ? "secondary" : "primary"}
              onClick={() => {
                markDismissed();
                setVisible(false);
              }}
            >
              {canNativeInstall || iosHint ? t("pwa.dismiss") : t("pwa.gotIt")}
            </Button>
          </div>
        </div>
        <button
          type="button"
          className="rounded-full p-1 text-muted"
          onClick={() => setVisible(false)}
          aria-label={t("pwa.dismiss")}
        >
          <AppIcon icon={X} size="sm" />
        </button>
      </div>
    </div>
  );
}
