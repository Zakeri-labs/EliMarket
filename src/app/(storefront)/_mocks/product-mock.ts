import type { Category, Product } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const CATEGORY_BY_LOCALE: Record<Locale, Category> = {
  fa: {
    id: "mock-category-fa",
    name: "لبنیات و صبحانه",
    name_fa: "لبنیات و صبحانه",
    name_ar: "منتجات الألبان والإفطار",
    name_en: "Dairy and breakfast",
    slug: "dairy",
    sort_order: 1,
    parent_id: null,
    image_url: null,
    blur_hash: null,
    created_at: MOCK_TIMESTAMP,
  },
  ar: {
    id: "mock-category-ar",
    name: "منتجات الألبان والإفطار",
    name_fa: "لبنیات و صبحانه",
    name_ar: "منتجات الألبان والإفطار",
    name_en: "Dairy and breakfast",
    slug: "dairy",
    sort_order: 1,
    parent_id: null,
    image_url: null,
    blur_hash: null,
    created_at: MOCK_TIMESTAMP,
  },
  en: {
    id: "mock-category-en",
    name: "Dairy and breakfast",
    name_fa: "لبنیات و صبحانه",
    name_ar: "منتجات الألبان والإفطار",
    name_en: "Dairy and breakfast",
    slug: "dairy",
    sort_order: 1,
    parent_id: null,
    image_url: null,
    blur_hash: null,
    created_at: MOCK_TIMESTAMP,
  },
};

const FLASH_DEAL_DATA: {
  slug: string;
  name_fa: string;
  name_ar: string;
  name_en: string;
  price: number;
  compare_at_price: number;
  image_url: string;
}[] = [
  {
    slug: "bananas-kg",
    name_fa: "موز (کیلو)",
    name_ar: "موز (كيلو)",
    name_en: "Bananas (kg)",
    price: 0.45,
    compare_at_price: 0.6,
    image_url: "/products/bananas.png",
  },
  {
    slug: "tomatoes-kg",
    name_fa: "گوجه (کیلو)",
    name_ar: "طماطم (كيلو)",
    name_en: "Tomatoes (kg)",
    price: 0.32,
    compare_at_price: 0.4,
    image_url: "/products/tomatoes.png",
  },
  {
    slug: "milk-full-fat-2l",
    name_fa: "شیر پرچرب ۲ لیتری",
    name_ar: "حليب كامل الدسم ۲ لتر",
    name_en: "Milk Full Fat 2L",
    price: 0.65,
    compare_at_price: 0.765,
    image_url: "/products/milk-2l.png",
  },
  {
    slug: "eggs-15-pack",
    name_fa: "تخم‌مرغ ۱۵ عددی",
    name_ar: "بيض ۱۵ قطعة",
    name_en: "Eggs 15 Pack",
    price: 4.1,
    compare_at_price: 4.8,
    image_url: "/products/eggs-15.png",
  },
  {
    slug: "crusty-bread-500g",
    name_fa: "نان ۵۰۰ گرمی",
    name_ar: "خبز ۵۰۰ غ",
    name_en: "Crusty Bread 500g",
    price: 0.95,
    compare_at_price: 1.1,
    image_url: "/products/bread-loaf.png",
  },
  {
    slug: "chicken-breast-1kg",
    name_fa: "سینه مرغ ۱ کیلو",
    name_ar: "صدر دجاج ۱ كيلو",
    name_en: "Chicken Breast 1kg",
    price: 3.85,
    compare_at_price: 4.5,
    image_url: "/products/chicken-breast.png",
  },
  {
    slug: "orange-juice-1l",
    name_fa: "آب پرتقال ۱ لیتری",
    name_ar: "عصير برتقال ۱ لتر",
    name_en: "Orange Juice 1L",
    price: 0.78,
    compare_at_price: 0.92,
    image_url: "/products/orange-juice.png",
  },
  {
    slug: "potato-chips-200g",
    name_fa: "چیپس ۲۰۰ گرمی",
    name_ar: "رقائق بطاطس ۲۰۰ غ",
    name_en: "Potato Chips 200g",
    price: 0.55,
    compare_at_price: 0.65,
    image_url: "/products/potato-chips.png",
  },
];

function localizedName(
  item: (typeof FLASH_DEAL_DATA)[number],
  locale: Locale,
): string {
  if (locale === "fa") return item.name_fa;
  if (locale === "ar") return item.name_ar;
  return item.name_en;
}

function buildMockProduct(
  locale: Locale,
  index: number,
  overrides?: Partial<Product>,
): Product {
  const item = FLASH_DEAL_DATA[index] ?? FLASH_DEAL_DATA[0];
  const category = CATEGORY_BY_LOCALE[locale];
  const name = localizedName(item, locale);

  return {
    id: `mock-product-${index}`,
    category_id: category.id,
    brand_id: null,
    name,
    slug: item.slug,
    description: `${name} — ${item.name_en === "Bananas (kg)" ? "Fresh yellow bananas sold by kilogram." : item.name_en === "Tomatoes (kg)" ? "Vine-ripened red tomatoes sold by kilogram." : "Quality grocery item for everyday use."}`,
    description_fa:
      item.slug === "bananas-kg"
        ? "موز تازه به‌ازای هر کیلوگرم."
        : item.slug === "tomatoes-kg"
          ? "گوجه فرنگی قرمز رسیده به‌ازای هر کیلوگرم."
          : item.slug === "milk-full-fat-2l"
            ? "شیر پرچرب پاستوریزه ۲ لیتری."
            : "محصول با کیفیت برای مصرف روزانه.",
    description_ar:
      item.slug === "bananas-kg"
        ? "موز أصفر طازج بالكيلogram."
        : item.slug === "tomatoes-kg"
          ? "طماطم حمراء ناضجة بالكيلogram."
          : item.slug === "milk-full-fat-2l"
            ? "حليب كامل الدسم مبستر ۲ لتر."
            : "منتج عالي الجودة للاستخدام اليومي.",
    description_en:
      item.slug === "bananas-kg"
        ? "Fresh yellow bananas sold by kilogram."
        : item.slug === "tomatoes-kg"
          ? "Vine-ripened red tomatoes sold by kilogram."
          : item.slug === "milk-full-fat-2l"
            ? "Full-fat pasteurized milk in a 2 liter bottle."
            : "Quality grocery item for everyday use.",
    price: item.price,
    compare_at_price: item.compare_at_price,
    currency: "OMR",
    stock: 24,
    inventory_unit: item.slug.includes("kg") ? "weight" : item.slug.includes("pack") ? "pack" : "count",
    low_stock_threshold: 5,
    image_url: item.image_url,
    blur_hash: null,
    is_active: true,
    created_at: MOCK_TIMESTAMP,
    category,
    ...overrides,
  };
}

/** Single product for product detail skeleton. */
export function mockProductDetail(locale: Locale): Product {
  return buildMockProduct(locale, 2, {
    id: "mock-product-detail",
    stock: 18,
  });
}

/** Typical homepage / category grid count (8 cards). */
export const MOCK_PRODUCT_GRID_COUNT = FLASH_DEAL_DATA.length;

export function mockProducts(locale: Locale): Product[] {
  return FLASH_DEAL_DATA.map((_, index) => buildMockProduct(locale, index));
}

/** Horizontal flash deals row (6 cards). */
export const MOCK_FLASH_DEALS_COUNT = 6;

export function mockFlashDeals(locale: Locale): Product[] {
  return mockProducts(locale).slice(0, MOCK_FLASH_DEALS_COUNT);
}
