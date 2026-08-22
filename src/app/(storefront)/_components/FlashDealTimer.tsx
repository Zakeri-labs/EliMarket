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

  const showFallback = !endsAt || remaining == null;
  const { hours, minutes, seconds } = showFallback
    ? { hours: 2, minutes: 45, seconds: 18 }
    : formatRemaining(remaining ?? 0);

  return (
    <div className="flex items-center gap-1.5 text-[11px] font-medium text-accent-gold sm:text-xs">
      <span className="whitespace-nowrap tracking-wide uppercase">{t("home.flashEndsIn")}</span>
      <div className="flex items-center gap-0.5 font-mono tabular-nums text-accent-gold">
        <span>{pad(hours)}</span>
        <span>:</span>
        <span>{pad(minutes)}</span>
        <span>:</span>
        <span>{pad(seconds)}</span>
      </div>
    </div>
  );
}
