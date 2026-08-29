"use client";

import { Moon, Sun } from "lucide-react";
import { useThemeStore } from "@/app/_store/theme-store";
import { cn } from "@/app/utils/cn";
import { AppIcon } from "@/components/icons/AppIcon";
import { useTranslations } from "@/i18n/use-translations";

type Props = {
  className?: string;
  compact?: boolean;
};

export function ThemeToggle({ className, compact = false }: Props) {
  const theme = useThemeStore((s) => s.theme);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);
  const { t } = useTranslations();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? t("common.themeLight") : t("common.themeDark")}
      title={isDark ? t("common.themeLight") : t("common.themeDark")}
      className={cn(
        "inline-flex items-center justify-center rounded-xl bg-surface text-foreground transition-colors hover:bg-surface-elevated",
        compact ? "h-10 w-10" : "gap-2 px-3 py-2 text-sm",
        className,
      )}
    >
      <AppIcon icon={isDark ? Sun : Moon} size={compact ? "md" : "sm"} />
      {!compact && (
        <span>{isDark ? t("common.themeLight") : t("common.themeDark")}</span>
      )}
    </button>
  );
}
