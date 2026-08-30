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
};

/** Renders a price with the fractional digits at the same size as the whole part, but not bold. */
export function Price({ amount, currency = DEFAULT_CURRENCY, className, fractionClassName }: Props) {
  const { locale } = useTranslations();
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  const fractionDigits = currency === "OMR" ? 3 : currency === "IRR" ? 0 : 2;
  const label =
    currency === "OMR" || currency === "IRR" ? getMessages(locale).brand.currency : currency;

  const parts = useMemo(
    () =>
      new Intl.NumberFormat(getNumberLocale(locale), {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).formatToParts(safeAmount),
    [safeAmount, locale, fractionDigits],
  );

  return (
    <span data-price className={cn("price-num tabular-nums", className)}>
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
      {label}
    </span>
  );
}
