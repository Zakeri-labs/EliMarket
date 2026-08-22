import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEFAULT_THEME,
  THEME_COOKIE,
  THEME_STORAGE_KEY,
  type StorefrontTheme,
} from "@/config/theme";

type ThemeState = {
  theme: StorefrontTheme;
  setTheme: (theme: StorefrontTheme) => void;
  toggleTheme: () => void;
};

function syncThemeCookie(theme: StorefrontTheme) {
  if (typeof document === "undefined") return;
  document.cookie = `${THEME_COOKIE}=${theme};path=/;max-age=31536000;SameSite=Lax`;
}

export function applyDocumentTheme(theme: StorefrontTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("theme-dark", "theme-light");
  root.classList.add(`theme-${theme}`);
  root.style.colorScheme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute("content", theme === "light" ? "#f5f5f5" : "#0b1210");
  }
  syncThemeCookie(theme);
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => {
        applyDocumentTheme(theme);
        set({ theme });
      },
      toggleTheme: () => {
        const next = get().theme === "dark" ? "light" : "dark";
        applyDocumentTheme(next);
        set({ theme: next });
      },
    }),
    {
      name: THEME_STORAGE_KEY,
      onRehydrateStorage: () => (state) => {
        if (state?.theme) applyDocumentTheme(state.theme);
      },
    },
  ),
);
