const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export const MONEY_INPUT_FRACTION_DIGITS = 3;

function toAsciiDigit(char: string): string {
  const persian = PERSIAN_DIGITS.indexOf(char);
  if (persian >= 0) return String(persian);
  const arabic = ARABIC_DIGITS.indexOf(char);
  if (arabic >= 0) return String(arabic);
  return char;
}

export function normalizeMoneyInput(raw: string): string {
  return [...raw]
    .map(toAsciiDigit)
    .join("")
    .replace(/[٬،]/g, ",")
    .replace(/٫/g, ".")
    .replace(/[^\d.,-]/g, "");
}

export function formatMoneyInputText(
  raw: string,
  maxFractionDigits = MONEY_INPUT_FRACTION_DIGITS,
): string {
  const normalized = normalizeMoneyInput(raw);
  if (!normalized) return "";

  const negative = normalized.startsWith("-");
  const body = negative ? normalized.slice(1) : normalized;
  const firstDot = body.indexOf(".");
  const intSource = (firstDot >= 0 ? body.slice(0, firstDot) : body).replace(/\D/g, "");
  const fracSource =
    firstDot >= 0
      ? body.slice(firstDot + 1).replace(/\D/g, "").slice(0, maxFractionDigits)
      : null;
  const groupedInt = intSource.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const sign = negative ? "-" : "";
  if (firstDot >= 0) return `${sign}${groupedInt}.${fracSource ?? ""}`;
  return `${sign}${groupedInt}`;
}

export function parseMoneyInputText(raw: string): number | null {
  const ascii = normalizeMoneyInput(raw).replace(/,/g, "");
  if (!ascii || ascii === "-" || ascii === "." || ascii === "-.") return null;
  const value = Number(ascii);
  return Number.isFinite(value) ? value : null;
}

export function formatMoneyFromNumber(
  value: number | null | undefined,
  maxFractionDigits = MONEY_INPUT_FRACTION_DIGITS,
): string {
  if (value == null || !Number.isFinite(value)) return "";
  return formatMoneyInputText(value.toFixed(maxFractionDigits).replace(/\.?0+$/, "") || "0");
}
