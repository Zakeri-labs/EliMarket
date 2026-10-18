"use client";

import { useMemo } from "react";
import { DEFAULT_CURRENCY } from "@/config/brand";
import { cn } from "@/app/utils/cn";
import { getNumberLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  amount: number;
  currency?: string;
  className?: string;
  fractionClassName?: string;
  /** @deprecated No longer used: OMR is shown as text, not a glyph. */
  symbolClassName?: string;
};

/**
 * Renders a price with the fractional digits at the same size as the whole part
 * (but not bold). Omani Rial is shown as the text "OMR" in every language.
 */
export function Price({
  amount,
  currency = DEFAULT_CURRENCY,
  className,
  fractionClassName,
}: Props) {
  const { locale } = useTranslations();
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const fractionDigits = currency === "OMR" ? 3 : currency === "IRR" ? 0 : 2;
  // OMR is shown as the code "OMR"; Arabic spells it out as "ريال".
  const textLabel =
    currency === "OMR" ? (locale === "ar" ? "ريال" : "OMR") : currency === "IRR" ? getMessages(locale).brand.currency : currency;

  const parts = useMemo(
    () =>
      new Intl.NumberFormat(getNumberLocale(locale), {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).formatToParts(safeAmount),
    [safeAmount, locale, fractionDigits],
  );

  // English reads "OMR 0.495" (code first); fa/ar keep the code after the number.
  const labelFirst = locale === "en";

  return (
    <span data-price className={cn("price-num tabular-nums whitespace-nowrap", className)}>
      {labelFirst ? <>{textLabel}{" "}</> : null}
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
      )}
      {labelFirst ? null : <>{" "}{textLabel}</>}
    </span>
  );
}
