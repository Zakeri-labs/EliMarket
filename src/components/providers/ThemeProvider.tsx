"use client";

import { useEffect } from "react";
import { applyDocumentTheme, useThemeStore } from "@/app/_store/theme-store";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const apply = () => applyDocumentTheme(useThemeStore.getState().theme);
    const unsub = useThemeStore.persist.onFinishHydration(apply);
    if (useThemeStore.persist.hasHydrated()) apply();
    return unsub;
  }, []);

  return children;
}
