import type { Category, Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const CATEGORY_BY_LOCALE: Record<Locale, Category> = {
  fa: {
    id: "mock-category-fa",
    name: "لبنیات و صبحانه",
    slug: "dairy-breakfast",
    sort_order: 1,
    created_at: MOCK_TIMESTAMP,
  },
  ar: {
    id: "mock-category-ar",
    name: "منتجات الألبان والإفطار",
    slug: "dairy-breakfast",
    sort_order: 1,
    created_at: MOCK_TIMESTAMP,
  },
  en: {
    id: "mock-category-en",
    name: "Dairy and breakfast",
    slug: "dairy-breakfast",
    sort_order: 1,
    created_at: MOCK_TIMESTAMP,
  },
};

const PRODUCT_COPY: Record<
  Locale,
  { name: string; description: string; slug: string }
> = {
  fa: {
    name: "شیر پاستوریزه یک لیتری با کیفیت روزانه",
    slug: "mock-pasteurized-milk-1l",
    description:
      "شیر پاستوریزه تازه با چربی استاندارد، مناسب مصرف روزانه خانواده. این محصول در دمای کنترل‌شده نگهداری می‌شود و برای صبحانه، دسر و نوشیدنی‌های گرم انتخابی مطمئن است.",
  },
  ar: {
    name: "حليب مبستر یک لتر طازج يومي",
    slug: "mock-pasteurized-milk-1l",
    description:
      "حليب مبستر طازج بنسبة دهون متوازنة، مناسب للاستهلاك اليومي للعائلة. يُحفظ في درجة حرارة م controlled ويُعد خيارًا موثوقًا للفطور والحلويات والمشروبات الساخنة.",
  },
  en: {
    name: "Fresh pasteurized milk 1 liter daily quality",
    slug: "mock-pasteurized-milk-1l",
    description:
      "Fresh pasteurized milk with standard fat content, suitable for everyday family use. Stored at a controlled temperature and a reliable choice for breakfast, desserts, and hot drinks.",
  },
};

const GRID_NAMES: Record<Locale, string[]> = {
  fa: [
    "شیر پاستوریزه یک لیتری",
    "ماست کم‌چرب 900 گرمی",
    "پنیر سفید 400 گرمی",
    "نان تست 500 گرمی",
    "تخم‌مرغ 15 عددی",
    "کره حیوانی 200 گرمی",
    "عسل طبیعی 500 گرمی",
    "چای سیاه 500 گرمی",
  ],
  ar: [
    "حليب مبستر 1 لتر",
    "زبادي قليل الدسم 900 غ",
    "جبنة بيضاء 400 غ",
    "خبز توست 500 غ",
    "بيض 15 قطعة",
    "زبدة 200 غ",
    "عسل طبيعي 500 غ",
    "شاي أسود 500 غ",
  ],
  en: [
    "Pasteurized milk 1L",
    "Low-fat yogurt 900g",
    "White cheese 400g",
    "Toast bread 500g",
    "Eggs pack of 15",
    "Butter 200g",
    "Natural honey 500g",
    "Black tea 500g",
  ],
};

function buildMockProduct(
  locale: Locale,
  index: number,
  overrides?: Partial<Product>,
): Product {
  const copy = PRODUCT_COPY[locale];
  const category = CATEGORY_BY_LOCALE[locale];
  const name = GRID_NAMES[locale][index] ?? copy.name;

  return {
    id: `mock-product-${index}`,
    category_id: category.id,
    name,
    slug: `${copy.slug}-${index}`,
    description: copy.description,
    price: 125_000 + index * 15_000,
    currency: "IRR",
    stock: 24,
    image_url: "/icon.png",
    blur_hash: null,
    is_active: true,
    created_at: MOCK_TIMESTAMP,
    category,
    ...overrides,
  };
}

/** Single product for product detail skeleton. */
export function mockProductDetail(locale: Locale): Product {
  return buildMockProduct(locale, 0, {
    id: "mock-product-detail",
    slug: PRODUCT_COPY[locale].slug,
    name: PRODUCT_COPY[locale].name,
    price: 289_000,
    stock: 18,
  });
}

/** Typical homepage / category grid count (8 cards). */
export const MOCK_PRODUCT_GRID_COUNT = 8;

export function mockProducts(locale: Locale): Product[] {
  return Array.from({ length: MOCK_PRODUCT_GRID_COUNT }, (_, index) =>
    buildMockProduct(locale, index),
  );
}

/** Horizontal flash deals row (4 cards). */
export const MOCK_FLASH_DEALS_COUNT = 4;

export function mockFlashDeals(locale: Locale): Product[] {
  return mockProducts(locale).slice(0, MOCK_FLASH_DEALS_COUNT);
}
