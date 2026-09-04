import type { ProductFeature } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { firstFitting } from "@/lib/i18n/locale-text";

/** Pick a product spec's label/value for the active locale — no cross-language mix. */
export function resolveFeatureText(
  feature: ProductFeature,
  locale: Locale,
): { label: string; value: string } {
  if (locale === "en") {
    return {
      label: firstFitting("en", feature.label_en) ?? "",
      value: firstFitting("en", feature.value_en) ?? "",
    };
  }

  if (locale === "ar") {
    return {
      label: firstFitting("ar", feature.label_ar) ?? "",
      value: firstFitting("ar", feature.value_ar) ?? "",
    };
  }

  return {
    label: firstFitting("fa", feature.label_fa, feature.label) ?? "",
    value: firstFitting("fa", feature.value_fa, feature.value) ?? "",
  };
}
