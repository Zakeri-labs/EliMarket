import type { Category } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const CATEGORY_DATA: {
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  image_url: string;
}[] = [
  {
    slug: "produce",
    name_fa: "میوه و سبزیجات",
    name_ar: "فواكه وخضروات",
    name_en: "Fruits & Vegetables",
    image_url:
      "https://images.unsplash.com/photo-1619566636852-ba0ecd850a70?w=400&q=80",
  },
  {
    slug: "dairy",
    name_fa: "لبنیات و تخم‌مرغ",
    name_ar: "منتجات الألبان والبيض",
    name_en: "Dairy & Eggs",
    image_url:
      "https://images.unsplash.com/photo-1563636619095-d2949ffd3997?w=400&q=80",
  },
  {
    slug: "meat",
    name_fa: "گوشت و مرغ",
    name_ar: "اللحوم والدواجن",
    name_en: "Meat & Poultry",
    image_url:
      "https://images.unsplash.com/photo-1603048588665-791ca9ecb617?w=400&q=80",
  },
  {
    slug: "bakery",
    name_fa: "نان و شیرینی",
    name_ar: "المخبوزات",
    name_en: "Bakery",
    image_url:
      "https://images.unsplash.com/photo-1509440161594-b23512a607ef?w=400&q=80",
  },
  {
    slug: "beverages",
    name_fa: "نوشیدنی‌ها",
    name_ar: "المشروبات",
    name_en: "Beverages",
    image_url:
      "https://images.unsplash.com/photo-1544145945-f904073aaa7b?w=400&q=80",
  },
  {
    slug: "snacks",
    name_fa: "تنقلات و شکلات",
    name_ar: "الوجبات الخفيفة والشوكولاتة",
    name_en: "Snacks & Chocolates",
    image_url:
      "https://images.unsplash.com/photo-1599592819558-5c6a4c4d4d2e?w=400&q=80",
  },
  {
    slug: "pantry",
    name_fa: "خواربار و اقلام پایه",
    name_ar: "المخزن والأساسيات",
    name_en: "Pantry & Staples",
    image_url:
      "https://images.unsplash.com/photo-1596040033229-a9821ebd114d?w=400&q=80",
  },
  {
    slug: "personal-care",
    name_fa: "مراقبت شخصی",
    name_ar: "العناية الشخصية",
    name_en: "Personal Care",
    image_url:
      "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80",
  },
  {
    slug: "household",
    name_fa: "لوازم خانگی",
    name_ar: "مستلزمات المنزل",
    name_en: "Household",
    image_url:
      "https://images.unsplash.com/photo-1585421514765-c3b2f2d7ec98?w=400&q=80",
  },
  {
    slug: "baby-care",
    name_fa: "مراقبت از نوزاد",
    name_ar: "رعاية الأطفال",
    name_en: "Baby Care",
    image_url:
      "https://images.unsplash.com/photo-1515488042361-ee00e0170ffa?w=400&q=80",
  },
];

function localizedName(
  item: (typeof CATEGORY_DATA)[number],
  locale: Locale,
): string {
  if (locale === "fa") return item.name_fa;
  if (locale === "ar") return item.name_ar;
  return item.name_en;
}

/** Full category listing page (10 items). */
export const MOCK_CATEGORY_LIST_COUNT = CATEGORY_DATA.length;

export function mockCategories(locale: Locale): Category[] {
  return CATEGORY_DATA.map((item, index) => ({
    id: `mock-category-${index}`,
    name: localizedName(item, locale),
    name_fa: item.name_fa,
    name_ar: item.name_ar,
    name_en: item.name_en,
    slug: item.slug,
    sort_order: index + 1,
    image_url: item.image_url,
    blur_hash: null,
    created_at: MOCK_TIMESTAMP,
  }));
}

/** Homepage sidebar grid (4 items). */
export const MOCK_CATEGORY_GRID_COUNT = 4;

export function mockCategoryGrid(locale: Locale): Category[] {
  return mockCategories(locale).slice(0, MOCK_CATEGORY_GRID_COUNT);
}
