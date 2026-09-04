import type { DeliveryArea } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { firstFitting, humanizeSlug } from "@/lib/i18n/locale-text";

/** Pick the delivery-area label for the active locale — never mix in another language. */
export function resolveDeliveryAreaName(
  area: Pick<DeliveryArea, "name_fa" | "name_ar" | "name_en"> & { slug?: string },
  locale: Locale,
): string {
  const localized = {
    fa: area.name_fa,
    ar: area.name_ar,
    en: area.name_en,
  }[locale];

  return firstFitting(locale, localized) || (area.slug ? humanizeSlug(area.slug) : "");
}
