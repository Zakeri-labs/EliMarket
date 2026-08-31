import type { DeliveryArea } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

/** Pick the delivery-area label for the active locale with sensible fallbacks. */
export function resolveDeliveryAreaName(
  area: Pick<DeliveryArea, "name_fa" | "name_ar" | "name_en">,
  locale: Locale,
): string {
  const localized = {
    fa: area.name_fa,
    ar: area.name_ar,
    en: area.name_en,
  }[locale];

  return (
    localized?.trim() ||
    area.name_fa?.trim() ||
    area.name_ar?.trim() ||
    area.name_en?.trim() ||
    ""
  );
}
