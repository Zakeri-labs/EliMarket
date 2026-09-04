import { onlyIfLocale } from "@/lib/i18n/locale-text";

export type ProductDescriptionsI18n = {
  description_fa: string;
  description_ar: string;
  description_en: string;
};

export function buildProductDescriptionStub(input: {
  name: string;
  category?: string;
}): ProductDescriptionsI18n {
  const { name, category } = input;
  const nameFa = onlyIfLocale(name, "fa") || name;
  const nameAr = onlyIfLocale(name, "ar");
  const nameEn = onlyIfLocale(name, "en");
  const categoryFa = onlyIfLocale(category, "fa");
  const categoryAr = onlyIfLocale(category, "ar");
  const categoryEn = onlyIfLocale(category, "en");

  return {
    description_fa: `${nameFa} — محصول تازه و باکیفیت${categoryFa ? ` در دسته ${categoryFa}` : ""}.`,
    description_ar: nameAr
      ? `${nameAr} — منتج طازج وعالي الجودة${categoryAr ? ` في فئة ${categoryAr}` : ""}.`
      : `منتج طازج وعالي الجودة${categoryAr ? ` في فئة ${categoryAr}` : ""}.`,
    description_en: nameEn
      ? `${nameEn} — fresh, high-quality product${categoryEn ? ` in ${categoryEn} category` : ""}.`
      : `Fresh, high-quality product${categoryEn ? ` in the ${categoryEn} category` : ""}.`,
  };
}
