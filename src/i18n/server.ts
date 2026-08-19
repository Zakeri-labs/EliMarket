import { cookies } from "next/headers";
import { DEFAULT_LOCALE, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";
import { resolveMessage } from "@/i18n/resolve-message";

export async function getRequestLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const value = cookieStore.get("elimarket-locale")?.value;
  if (value === "fa" || value === "ar" || value === "en") return value;
  return DEFAULT_LOCALE;
}

export async function serverT(
  path: string,
  params?: Record<string, string | number>,
): Promise<string> {
  const locale = await getRequestLocale();
  return resolveMessage(getMessages(locale), path, params) ?? path;
}
