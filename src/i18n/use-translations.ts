"use client";

import { useMemo } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getDirection, getNumberLocale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { interpolate } from "@/i18n/translate";

export function useTranslations() {
  const locale = useLocaleStore((s) => s.locale);
  const setLocale = useLocaleStore((s) => s.setLocale);
  const m = getMessages(locale);
  const dir = getDirection(locale);

  const t = useMemo(
    () =>
      (path: string, params?: Record<string, string | number>): string => {
        const value = path.split(".").reduce<unknown>((obj, key) => {
          if (obj && typeof obj === "object" && key in obj) {
            return (obj as Record<string, unknown>)[key];
          }
          return undefined;
        }, m as unknown);

        if (typeof value === "string") return interpolate(value, params);
        return path;
      },
    [m],
  );

  return { t, locale, setLocale, dir, messages: m };
}

export function useFormatPrice() {
  const locale = useLocaleStore((s) => s.locale);
  const m = getMessages(locale);

  return (amount: number, currency = "IRR") => {
    const formatted = amount.toLocaleString(getNumberLocale(locale));
    return `${formatted} ${currency === "IRR" ? m.brand.currency : currency}`;
  };
}
