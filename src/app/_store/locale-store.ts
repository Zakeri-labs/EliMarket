import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_LOCALE,
  getDirection,
  type Locale,
} from "@/i18n/config";

type LocaleState = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

function applyDocumentLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  document.documentElement.dir = getDirection(locale);
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: DEFAULT_LOCALE,
      setLocale: (locale) => {
        applyDocumentLocale(locale);
        set({ locale });
      },
    }),
    {
      name: "elimarket-locale",
      onRehydrateStorage: () => (state) => {
        if (state?.locale) applyDocumentLocale(state.locale);
      },
    },
  ),
);
