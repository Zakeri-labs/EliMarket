"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { DEFAULT_LOCALE, getDirection } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const m = getMessages(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    document.title = m.brand.nameLocal;
  }, [locale]);

  return children;
}
