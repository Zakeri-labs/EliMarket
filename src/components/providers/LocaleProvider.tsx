"use client";

import { useEffect } from "react";
import { useLocaleStore } from "@/app/_store/locale-store";
import { getDirection } from "@/i18n/config";

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = getDirection(locale);
  }, [locale]);

  return children;
}
