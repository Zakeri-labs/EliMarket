export const STOREFRONT_THEMES = ["dark", "light"] as const;
export type StorefrontTheme = (typeof STOREFRONT_THEMES)[number];

export const DEFAULT_THEME: StorefrontTheme = "dark";
export const THEME_COOKIE = "elimarket-theme";
export const THEME_STORAGE_KEY = "elimarket-theme";

export function isStorefrontTheme(value: string | undefined | null): value is StorefrontTheme {
  return value === "dark" || value === "light";
}
