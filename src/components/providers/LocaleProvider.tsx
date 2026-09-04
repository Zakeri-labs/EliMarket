"use client";

import { useEffect, useRef } from "react";
import { seedLocaleFromServer, useLocaleStore } from "@/app/_store/locale-store";
import { getDirection, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale: Locale;
}) {
  const seeded = useRef(false);
  if (!seeded.current) {
    seedLocaleFromServer(initialLocale);
    seeded.current = true;
  }

  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    const m = getMessages(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
    document.title = m.brand.nameLocal;
  }, [locale]);

  return children;
}
