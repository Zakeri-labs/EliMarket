"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/i18n/use-translations";

function secondsUntil(iso: string) {
  return Math.max(0, Math.floor((new Date(iso).getTime() - Date.now()) / 1000));
}

function endOfTodayIso() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

function breakdown(total: number) {
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
  };
}

type Props = {
  /** Campaign end time. When absent and `fallback` is set, counts down to local midnight. */
  endsAt?: string | null;
  fallback?: boolean;
};

export function FlashDealTimer({ endsAt, fallback = false }: Props) {
  const { t, locale } = useTranslations();
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    const target = endsAt ?? (fallback ? endOfTodayIso() : null);
    if (!target) {
      setRemaining(null);
      return;
    }
    const tick = () => setRemaining(secondsUntil(target));
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [endsAt, fallback]);

  if (remaining == null || remaining <= 0) return null;

  const { days, hours, minutes, seconds } = breakdown(remaining);
  const localeTag = locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-EG" : "en-US";
  const fmt = (value: number) =>
    value.toLocaleString(localeTag, {
      minimumIntegerDigits: 2,
      useGrouping: false,
    });

  const segments = [
    ...(days > 0 ? [{ key: "d", value: days, label: t("home.flashDaysLabel") }] : []),
    { key: "h", value: hours, label: t("home.flashHrsLabel") },
    { key: "m", value: minutes, label: t("home.flashMinLabel") },
    { key: "s", value: seconds, label: t("home.flashSecLabel") },
  ];

  return (
    <div
      dir="ltr"
      className="inline-flex items-center gap-2 rounded-full border border-accent-gold/30 bg-accent-gold/10 px-2.5 py-1"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-accent-gold">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-gold opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent-gold" />
        </span>
        {t("home.flashEndsIn")}
      </span>
      <span className="flex items-center gap-1">
        {segments.map((segment, index) => (
          <span key={segment.key} className="flex items-center gap-1">
            {index > 0 && (
              <span className="pb-2 text-xs font-bold text-accent-gold/50">:</span>
            )}
            <span className="flex flex-col items-center">
              <span className="min-w-[1.75rem] rounded-md bg-accent-gold px-1 py-0.5 text-center text-sm font-bold leading-none tabular-nums text-bg-main">
                {fmt(segment.value)}
              </span>
              <span className="mt-0.5 text-[8px] font-medium uppercase leading-none text-accent-gold/80">
                {segment.label}
              </span>
            </span>
          </span>
        ))}
      </span>
    </div>
  );
}
