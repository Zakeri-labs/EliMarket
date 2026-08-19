import type { Messages } from "@/i18n/messages";
import { interpolate } from "@/i18n/translate";

export function resolveMessage(
  messages: Messages,
  path: string,
  params?: Record<string, string | number>,
): string | undefined {
  const value = path.split(".").reduce<unknown>((obj, key) => {
    if (obj && typeof obj === "object" && key in obj) {
      return (obj as Record<string, unknown>)[key];
    }
    return undefined;
  }, messages as unknown);

  if (typeof value === "string") return interpolate(value, params);
  return undefined;
}
