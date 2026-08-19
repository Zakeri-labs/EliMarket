import type { Category } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const CATEGORY_NAMES: Record<Locale, string[]> = {
  fa: [
    "میوه و سبزیجات",
    "لبنیات و صبحانه",
    "گوشت و پروتئین",
    "نان و شیرینی",
    "نوشیدنی‌ها",
    "مواد غذایی خشک",
    "کنسرو و کمپوت",
    "تنقلات و شکلات",
  ],
  ar: [
    "فواكه وخضروات",
    "منتجات الألبان والإفطار",
    "اللحوم والبروتين",
    "الخبز والمعجنات",
    "المشروبات",
    "مواد غذائية جافة",
    "معلبات",
    "وجبات خفيفة وحلويات",
  ],
  en: [
    "Fruits and vegetables",
    "Dairy and breakfast",
    "Meat and protein",
    "Bread and bakery",
    "Beverages",
    "Dry groceries",
    "Canned goods",
    "Snacks and chocolate",
  ],
};

const CATEGORY_SLUGS = [
  "produce",
  "dairy",
  "meat",
  "bakery",
  "beverages",
  "dry-goods",
  "canned",
  "snacks",
];

/** Full category listing page (8 items). */
export const MOCK_CATEGORY_LIST_COUNT = 8;

export function mockCategories(locale: Locale): Category[] {
  return CATEGORY_NAMES[locale].map((name, index) => ({
    id: `mock-category-${index}`,
    name,
    slug: CATEGORY_SLUGS[index] ?? `category-${index}`,
    sort_order: index,
    image_url: null,
    blur_hash: null,
    created_at: MOCK_TIMESTAMP,
  }));
}

/** Homepage sidebar grid (4 items). */
export const MOCK_CATEGORY_GRID_COUNT = 4;

export function mockCategoryGrid(locale: Locale): Category[] {
  return mockCategories(locale).slice(0, MOCK_CATEGORY_GRID_COUNT);
}
