"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/use-translations";

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

function secondsUntil(iso: string) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

function formatRemaining(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { hours, minutes, seconds };
}

export function FlashDealTimer({ endsAt }: { endsAt?: string | null }) {
  const { t } = useTranslations();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(secondsUntil(endsAt));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt]);

  if (!endsAt || remaining == null) return null;

  const { hours, minutes, seconds } = formatRemaining(remaining);

  return (
    <div className="flex items-center gap-1.5 text-[11px] text-muted sm:text-xs">
      <span className="whitespace-nowrap">{t("home.flashEndsIn")}</span>
      <div className="flex items-center gap-0.5 font-mono tabular-nums text-foreground">
        <span className="rounded-md bg-surface-elevated px-1.5 py-0.5">{pad(hours)}</span>
        <span>:</span>
        <span className="rounded-md bg-surface-elevated px-1.5 py-0.5">{pad(minutes)}</span>
        <span>:</span>
        <span className="rounded-md bg-surface-elevated px-1.5 py-0.5">{pad(seconds)}</span>
      </div>
    </div>
  );
}
