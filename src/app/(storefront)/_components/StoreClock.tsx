"use client";

import { useEffect, useState } from "react";
import { cn } from "@/app/utils/cn";
import { useTranslations } from "@/i18n/use-translations";

const STORE_TIME_ZONE = "Asia/Muscat";

const muscatFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: STORE_TIME_ZONE,
  hour: "numeric",
  minute: "numeric",
  second: "numeric",
  hourCycle: "h23",
});

type ClockTime = { h: number; m: number; s: number };

function muscatNow(): ClockTime {
  const parts = muscatFormatter.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);
  return { h: get("hour"), m: get("minute"), s: get("second") };
}

const TICKS = Array.from({ length: 60 }, (_, i) => i);

type Props = {
  /** `stacked`: city / clock / hours in a column (sidebar). `inline`: clock beside the text (mobile). */
  layout?: "stacked" | "inline";
  className?: string;
};

/** Simple station-style wall clock showing the store's local (Muscat) time. */
export function StoreClock({ layout = "stacked", className }: Props) {
  const inline = layout === "inline";
  const { t, locale } = useTranslations();
  // Time is only known on the client; rendering it on the server would mismatch on hydration.
  const [time, setTime] = useState<ClockTime | null>(null);

  useEffect(() => {
    const tick = () => setTime(muscatNow());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const hourAngle = time ? (time.h % 12) * 30 + time.m * 0.5 : 0;
  const minuteAngle = time ? time.m * 6 + time.s * 0.1 : 0;
  const secondAngle = time ? time.s * 6 : 0;
  const label = time
    ? t("home.storeClockLabel", {
        time: `${String(time.h).padStart(2, "0")}:${String(time.m).padStart(2, "0")}`,
      })
    : t("home.storeClockCity");

  const cityLabel = (
    <p
      className={cn(
        "text-sm font-semibold text-text-primary",
        locale === "en" && "uppercase tracking-[0.18em]",
      )}
    >
      {t("home.storeClockCity")}
    </p>
  );
  const openLabel = (
    <p className="inline-flex items-center gap-2 text-base font-bold text-text-primary">
      <span className="size-2 rounded-full bg-accent-gold" aria-hidden />
      {t("home.storeOpen24h")}
    </p>
  );

  return (
    <div
      className={cn(
        "flex w-full items-center rounded-xl border border-border-subtle bg-bg-card",
        inline ? "flex-row gap-4 px-4 py-3" : "flex-col gap-3 px-4 pb-5 pt-4",
        className,
      )}
    >
      {inline ? null : cityLabel}

      <svg
        viewBox="0 0 200 200"
        width={inline ? 76 : 132}
        height={inline ? 76 : 132}
        role="img"
        aria-label={label}
        className="shrink-0"
      >
        <circle cx="100" cy="100" r="95" fill="var(--surface)" stroke="var(--foreground)" strokeWidth="5" />
        {TICKS.map((i) => {
          const isHour = i % 5 === 0;
          return (
            <line
              key={i}
              x1="100"
              y1={isHour ? 12 : 13}
              x2="100"
              y2={isHour ? 28 : 19}
              stroke="var(--foreground)"
              strokeWidth={isHour ? 4.5 : 1.6}
              strokeLinecap="butt"
              transform={`rotate(${i * 6} 100 100)`}
            />
          );
        })}

        {time ? (
          <>
            <line
              x1="100"
              y1="114"
              x2="100"
              y2="52"
              stroke="var(--foreground)"
              strokeWidth="7"
              strokeLinecap="round"
              transform={`rotate(${hourAngle} 100 100)`}
            />
            <line
              x1="100"
              y1="116"
              x2="100"
              y2="26"
              stroke="var(--foreground)"
              strokeWidth="4.5"
              strokeLinecap="round"
              transform={`rotate(${minuteAngle} 100 100)`}
            />
            <g transform={`rotate(${secondAngle} 100 100)`}>
              <line x1="100" y1="124" x2="100" y2="30" stroke="var(--accent-gold)" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="100" cy="36" r="5" fill="var(--accent-gold)" />
            </g>
          </>
        ) : null}
        <circle cx="100" cy="100" r="5.5" fill="var(--foreground)" />
        <circle cx="100" cy="100" r="2" fill="var(--accent-gold)" />
      </svg>

      {inline ? (
        <div className="flex min-w-0 flex-col items-start gap-1">
          {cityLabel}
          {openLabel}
        </div>
      ) : (
        openLabel
      )}
    </div>
  );
}
