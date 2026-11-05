"use client";

import { omanYmd } from "@/config/oman-time";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { getDirection, getNumberLocale } from "@/i18n/config";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  /** `YYYY-MM-DD` (or `YYYY-MM-DDTHH:mm` with `withTime`), or an empty string when unset. */
  value: string;
  onChange: (value: string) => void;
  withTime?: boolean;
  id?: string;
  "aria-label"?: string;
};

const pad = (n: number) => String(n).padStart(2, "0");
const toIso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function parseIso(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** Calendar field replacing the native date input. Arrow keys move, Enter picks, Esc closes. */
export function DatePicker({ value, onChange, withTime, id, "aria-label": ariaLabel }: Props) {
  const { t } = useTranslations();
  const autoId = useId();
  const calendarId = `${id ?? autoId}-calendar`;
  const locale = useLocaleStore((s) => s.locale);
  // The grid is Gregorian, so labels must be too: fa-IR otherwise formats as Jalali.
  const numberLocale = `${getNumberLocale(locale)}-u-ca-gregory`;
  const rtl = getDirection(locale) === "rtl";
  const selected = parseIso(value);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState<Date>(() => selected ?? (parseIso(omanYmd()) as Date));
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  // Month changes unmount the focused day, so focus cannot be checked after render.
  const refocusGrid = useRef(false);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    // Capture on window runs before Radix's document listener, so Esc closes only this.
    const onEscape = (e: globalThis.KeyboardEvent) => {
      if (e.key !== "Escape") return;
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    };
    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onEscape, true);
    gridRef.current?.querySelector<HTMLElement>("[data-cursor=true]")?.focus();
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onEscape, true);
    };
  }, [open]);

  useEffect(() => {
    if (refocusGrid.current) {
      refocusGrid.current = false;
      gridRef.current?.querySelector<HTMLElement>("[data-cursor=true]")?.focus();
    }
  }, [cursor]);

  const days = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const count = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    return {
      offset: first.getDay(),
      list: Array.from(
        { length: count },
        (_, i) => new Date(cursor.getFullYear(), cursor.getMonth(), i + 1),
      ),
    };
  }, [cursor]);

  const weekdays = useMemo(
    () =>
      Array.from({ length: 7 }, (_, i) =>
        new Date(2024, 0, 7 + i).toLocaleDateString(numberLocale, { weekday: "narrow" }),
      ),
    [numberLocale],
  );

  const move = (byDays: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth(), c.getDate() + byDays));
  const moveMonth = (by: number) =>
    setCursor((c) => new Date(c.getFullYear(), c.getMonth() + by, 1));
  const pick = (d: Date) => {
    onChange(withTime ? `${toIso(d)}T${value.slice(11, 16) || "00:00"}` : toIso(d));
    if (withTime) {
      setCursor(d);
      return;
    }
    setOpen(false);
    triggerRef.current?.focus();
  };

  const onGridKey = (e: KeyboardEvent) => {
    const step = rtl ? -1 : 1;
    const actions: Record<string, () => void> = {
      ArrowRight: () => move(step),
      ArrowLeft: () => move(-step),
      ArrowDown: () => move(7),
      ArrowUp: () => move(-7),
      PageDown: () => moveMonth(1),
      PageUp: () => moveMonth(-1),
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      refocusGrid.current = true;
      action();
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? calendarId : undefined}
        aria-label={ariaLabel}
        onClick={() => {
          setCursor(selected ?? (parseIso(omanYmd()) as Date));
          setOpen((v) => !v);
        }}
        className="flex w-full items-center justify-between gap-2 bg-card px-3 text-start"
      >
        <span className={cn(!selected && "text-muted")} dir="ltr">
          {selected
            ? selected.toLocaleDateString(numberLocale, { dateStyle: "medium" }) +
              (withTime && value.length > 10 ? ` ${value.slice(11, 16)}` : "")
            : "—"}
        </span>
        <AppIcon icon={CalendarDays} size="sm" className="shrink-0 text-muted" />
      </button>

      {open ? (
        <div
          role="dialog"
          id={calendarId}
          aria-label={ariaLabel}
          className="admin-card mt-2 w-full max-w-[19rem] border border-border p-3"
        >
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              aria-label={t("table.prev")}
              onClick={() => moveMonth(-1)}
              className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-background md:h-9 md:w-9"
            >
              <AppIcon icon={rtl ? ChevronRight : ChevronLeft} size="sm" />
            </button>
            <span className="text-sm font-semibold" aria-live="polite">
              {cursor.toLocaleDateString(numberLocale, { month: "long", year: "numeric" })}
            </span>
            <button
              type="button"
              aria-label={t("table.next")}
              onClick={() => moveMonth(1)}
              className="grid h-11 w-11 place-items-center rounded-full text-muted hover:bg-background md:h-9 md:w-9"
            >
              <AppIcon icon={rtl ? ChevronLeft : ChevronRight} size="sm" />
            </button>
          </div>
          <div className="grid grid-cols-7 text-center text-xs text-muted" aria-hidden>
            {weekdays.map((d, i) => (
              <span key={i} className="py-1">
                {d}
              </span>
            ))}
          </div>
          <div ref={gridRef} onKeyDown={onGridKey} className="grid grid-cols-7 gap-0.5">
            {Array.from({ length: days.offset }, (_, i) => (
              <span key={`blank-${i}`} />
            ))}
            {days.list.map((d) => {
              const iso = toIso(d);
              const isSelected = iso === value.slice(0, 10);
              const isCursor = iso === toIso(cursor);
              return (
                <button
                  key={iso}
                  type="button"
                  data-cursor={isCursor}
                  tabIndex={isCursor ? 0 : -1}
                  aria-pressed={isSelected}
                  aria-label={d.toLocaleDateString(numberLocale, { dateStyle: "full" })}
                  onClick={() => pick(d)}
                  className={cn(
                    "min-h-11 w-full rounded-full md:min-h-10 text-sm transition-colors",
                    isSelected ? "bg-accent text-accent-foreground" : "hover:bg-accent/10",
                  )}
                >
                  {d.toLocaleDateString(numberLocale, { day: "numeric" })}
                </button>
              );
            })}
          </div>
          {withTime ? (
            <input
              type="time"
              aria-label={ariaLabel}
              className="mt-2 w-full bg-card px-3"
              dir="ltr"
              value={value.slice(11, 16)}
              onChange={(e) =>
                onChange(`${value.slice(0, 10) || toIso(cursor)}T${e.target.value || "00:00"}`)
              }
            />
          ) : null}
          {value ? (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                triggerRef.current?.focus();
              }}
              className="mt-2 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm text-muted hover:bg-background md:min-h-9"
            >
              <AppIcon icon={X} size="xs" />
              {t("table.clearDate")}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
