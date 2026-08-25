"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { AppIcon } from "@/components/icons/AppIcon";
import { Button } from "@/components/ui/Button";
import { useTranslations } from "@/i18n/use-translations";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaProvider() {
  const { t } = useTranslations();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Dev-mode Next.js reuses static chunk filenames across recompiles, so a
    // cache-first service worker here would keep serving old JS/pages forever
    // regardless of server restarts. Only register it in production, and
    // actively clean up any copy a dev browser already registered earlier.
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

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      if (window.localStorage.getItem("elimarket-pwa-dismissed") !== "1") {
        setVisible(true);
      }
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 rounded-2xl border border-border bg-surface p-4 shadow-lg md:bottom-6 md:max-w-sm md:start-auto md:end-6">
      <div className="flex items-start gap-3">
        <AppIcon icon={Download} size="md" className="mt-0.5 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{t("pwa.installTitle")}</p>
          <p className="mt-1 text-xs text-muted">{t("pwa.installDesc")}</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                await deferred.prompt();
                setVisible(false);
                setDeferred(null);
              }}
            >
              {t("pwa.install")}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => {
                window.localStorage.setItem("elimarket-pwa-dismissed", "1");
                setVisible(false);
              }}
            >
              {t("pwa.dismiss")}
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
