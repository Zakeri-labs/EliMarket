/** The store runs on Muscat time everywhere, whatever the server or browser zone is. */
export const OMAN_TIME_ZONE = "Asia/Muscat";

// Oman has no daylight saving, so the offset is fixed.
const OMAN_OFFSET = "+04:00";

function omanParts(date: Date) {
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
