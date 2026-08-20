"use client";

import { useMemo } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { formatPrice as formatPriceValue, DEFAULT_CURRENCY } from "@/config/brand";
import { getDirection } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { resolveMessage } from "@/i18n/resolve-message";

export function useTranslations() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const m = getMessages(locale);
  const dir = getDirection(locale);

  const t = useMemo(
    () =>
      (path: string, params?: Record<string, string | number>): string => {
        return resolveMessage(m, path, params) ?? path;
      },
    [m],
  );

  return { t, locale, setLocale, dir, messages: m };
}

export function useFormatPrice() {
  const locale = useLocaleStore((s) => s.locale);

  return (amount: number, currency = DEFAULT_CURRENCY) =>
    formatPriceValue(amount, currency, locale);
}
