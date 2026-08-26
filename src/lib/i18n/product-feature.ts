import type { ProductFeature } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

/** Pick a product spec's label/value for the active locale with sensible fallbacks. */
export function resolveFeatureText(
  feature: ProductFeature,
  locale: Locale,
): { label: string; value: string } {
  const localizedLabel = {
    fa: feature.label_fa,
    ar: feature.label_ar,
    en: feature.label_en,
  }[locale];
  const localizedValue = {
    fa: feature.value_fa,
    ar: feature.value_ar,
    en: feature.value_en,
  }[locale];

  const label =
    localizedLabel?.trim() ||
    feature.label_fa?.trim() ||
    feature.label_ar?.trim() ||
    feature.label_en?.trim() ||
    feature.label;
  const value =
    localizedValue?.trim() ||
    feature.value_fa?.trim() ||
    feature.value_ar?.trim() ||
    feature.value_en?.trim() ||
    feature.value;

  return { label, value };
}
