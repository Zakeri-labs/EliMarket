import type { Locale } from "@/i18n/config";

/** The store runs on Muscat time everywhere, whatever the server or browser zone is. */
export const OMAN_TIME_ZONE = "Asia/Muscat";

// Oman has no daylight saving, so the offset is fixed.
const OMAN_OFFSET = "+04:00";

function omanParts(date: Date) {
  // An invalid date would make the formatter throw.
  if (Number.isNaN(date.getTime())) return { ymd: "", hm: "", hour: 0 };
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: OMAN_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    hm: `${get("hour")}:${get("minute")}`,
    hour: Number(get("hour")),
  };
}

// Day-first in every language and always the Gregorian calendar, the same one the date picker uses.
const DATE_LOCALES: Record<Locale, string> = {
  en: "en-GB",
  ar: "ar-OM",
  fa: "fa-IR-u-ca-gregory",
};

/** Shows a moment as a date in Oman; the options replace the default day/month/year. */
export function formatOmanDate(
  value: Date | string | null | undefined,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { day: "2-digit", month: "2-digit", year: "numeric" },
): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(DATE_LOCALES[locale], { timeZone: OMAN_TIME_ZONE, ...options });
}

export function formatOmanDateTime(value: Date | string | null | undefined, locale: Locale): string {
  return formatOmanDate(value, locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** `YYYY-MM-DD` of the given moment in Oman. */
export function omanYmd(date: Date = new Date()): string {
  return omanParts(date).ymd;
}

export function omanHour(date: Date = new Date()): number {
  return omanParts(date).hour;
}

/** `YYYY-MM-DDTHH:mm` in Oman, the value format of the date-time picker. */
export function toOmanInput(value: Date | string = new Date()): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const { ymd, hm } = omanParts(date);
  return `${ymd}T${hm}`;
}

/** Reads a zone-less admin value (`YYYY-MM-DD` or `YYYY-MM-DDTHH:mm`) as Oman time. */
export function parseOmanInput(raw: string): Date {
  const value = raw.trim();
  if (/[T ]\d{2}:\d{2}.*(Z|[+-]\d{2}(:?\d{2})?)$/i.test(value)) return new Date(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return new Date(`${value}T00:00:00${OMAN_OFFSET}`);
  return new Date(`${value}${OMAN_OFFSET}`);
}
