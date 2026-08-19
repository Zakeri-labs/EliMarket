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
  const categoryFa = category ? ` در دسته ${category}` : "";
  const categoryAr = category ? ` في فئة ${category}` : "";
  const categoryEn = category ? ` in ${category} category` : "";

  return {
    description_fa: `${name} — محصول تازه و باکیفیت${categoryFa}.`,
    description_ar: `${name} — منتج طازج وعالي الجودة${categoryAr}.`,
    description_en: `${name} — fresh, high-quality product${categoryEn}.`,
  };
}
