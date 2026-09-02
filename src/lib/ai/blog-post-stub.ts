import { STORE_LOCATION } from "@/config/store-location";

export type BlogPostDraftI18n = {
  title_fa: string;
  title_ar: string;
  title_en: string;
  excerpt_fa: string;
  excerpt_ar: string;
  excerpt_en: string;
  body_fa: string;
  body_ar: string;
  body_en: string;
};

/**
 * Deterministic offline fallback for the blog draft. Produces a short, honest
 * post keyed to the store's location so the admin always has something to edit
 * even with no AI key configured.
 */
export function buildBlogPostStub(topic: string): BlogPostDraftI18n {
  const t = topic.trim() || "Our store";
  const { name, district, city, country, googleMapsUrl } = STORE_LOCATION;

  return {
    title_fa: t,
    title_ar: t,
    title_en: t,
    excerpt_fa: `یادداشتی کوتاه از ${name} در ${district.fa}، ${city.fa}.`,
    excerpt_ar: `ملاحظة قصيرة من ${name} في ${district.ar}، ${city.ar}.`,
    excerpt_en: `A short note from ${name} in ${district.en}, ${city.en}.`,
    body_fa: `## ${t}\nفروشگاه ${name} در ${district.fa}، ${city.fa}، ${country.fa} قرار دارد.\n\nمسیر دقیق روی نقشه: ${googleMapsUrl}\n\n_این متن یک پیش‌نویس است؛ پیش از انتشار آن را کامل و ویرایش کنید._`,
    body_ar: `## ${t}\nيقع متجر ${name} في ${district.ar}، ${city.ar}، ${country.ar}.\n\nالموقع على الخريطة: ${googleMapsUrl}\n\n_هذا النص مسودّة؛ أكمِله وحرِّره قبل النشر._`,
    body_en: `## ${t}\n${name} is located in ${district.en}, ${city.en}, ${country.en}.\n\nMap directions: ${googleMapsUrl}\n\n_This is a draft — expand and edit it before publishing._`,
  };
}
