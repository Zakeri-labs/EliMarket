"use client";

import { useMemo } from "react";
import { DEFAULT_CURRENCY } from "@/config/brand";
import { cn } from "@/app/utils/cn";
import { getNumberLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { useTranslations } from "@/i18n/use-translations";
import { OmrSymbol } from "@/components/ui/OmrSymbol";

type Props = {
  amount: number;
  currency?: string;
  className?: string;
  fractionClassName?: string;
  /** Extra classes for the Omani Rial glyph (e.g. to nudge its size). */
  symbolClassName?: string;
};

/**
 * Renders a price with the fractional digits at the same size as the whole part
 * (but not bold). For Omani Rial the currency is shown as the official glyph
 * (<OmrSymbol/>) instead of the "OMR" / "ر.ع." text; every other currency keeps
 * its short code.
 */
export function Price({
  amount,
  currency = DEFAULT_CURRENCY,
  className,
  fractionClassName,
  symbolClassName,
}: Props) {
  const { locale } = useTranslations();
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const fractionDigits = currency === "OMR" ? 3 : currency === "IRR" ? 0 : 2;
  const textLabel =
    currency === "OMR" || currency === "IRR" ? getMessages(locale).brand.currency : currency;
  const useGlyph = currency === "OMR";

  const parts = useMemo(
    () =>
      new Intl.NumberFormat(getNumberLocale(locale), {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).formatToParts(safeAmount),
    [safeAmount, locale, fractionDigits],
  );

  return (
    <span data-price className={cn("price-num tabular-nums whitespace-nowrap", className)}>
      {parts.map((part, i) =>
        part.type === "decimal" || part.type === "fraction" ? (
          <span
            key={i}
            className={cn("font-normal", fractionClassName)}
          >
            {part.value}
          </span>
        ) : (
          <span key={i}>{part.value}</span>
        ),
      )}{" "}
      {useGlyph ? <OmrSymbol className={symbolClassName} label={textLabel} /> : textLabel}
    </span>
  );
}
