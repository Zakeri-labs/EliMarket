import type { Product } from "@/app/_types/database.types";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const MOCK_CATEGORY = {
  id: "mock-admin-category",
  name: "Dairy and breakfast",
  name_fa: "لبنیات و صبحانه",
  name_ar: "منتجات الألبان والإفطار",
  name_en: "Dairy and breakfast",
  slug: "dairy-breakfast",
  sort_order: 1,
  parent_id: null,
  image_url: null,
  blur_hash: null,
  created_at: MOCK_TIMESTAMP,
};

const ROWS: Array<Pick<Product, "name" | "slug" | "price" | "stock" | "is_active">> = [
  {
    name: "Pasteurized milk 1L family pack",
    slug: "admin-mock-milk-1l",
    price: 2.89,
    stock: 42,
    is_active: true,
  },
  {
    name: "Low-fat yogurt 900g plain",
    slug: "admin-mock-yogurt-900g",
    price: 1.75,
    stock: 28,
    is_active: true,
  },
  {
    name: "White cheese 400g breakfast block",
    slug: "admin-mock-cheese-400g",
    price: 3.2,
    stock: 0,
    is_active: false,
  },
  {
    name: "Whole wheat toast bread 500g",
    slug: "admin-mock-bread-500g",
    price: 0.95,
    stock: 64,
    is_active: true,
  },
  {
    name: "Free-range eggs pack of 15",
    slug: "admin-mock-eggs-15",
    price: 4.1,
    stock: 19,
    is_active: true,
  },
];

/** Typical admin products table page (5 rows). */
export const MOCK_ADMIN_PRODUCT_TABLE_COUNT = ROWS.length;

export function mockAdminTableProducts(): Product[] {
  return ROWS.map((row, index) => ({
    id: `mock-admin-product-${index}`,
    category_id: MOCK_CATEGORY.id,
    brand_id: null,
    name: row.name,
    slug: row.slug,
    description:
      "Sample admin table description with realistic paragraph length for stable row height during skeleton loading.",
    description_fa:
      "توضیحات نمونه برای نمایش اسکلتون جدول محصولات در پنل ادمین.",
    description_ar: "وصف تجريبي لعرض هيكل جدول المنتجات في لوحة الإدارة.",
    description_en:
      "Sample description for the admin product table skeleton loading state.",
    price: row.price,
    compare_at_price: null,
    currency: "OMR",
    stock: row.stock,
    inventory_unit: "count",
    low_stock_threshold: 5,
    image_url: "/icon.png",
    blur_hash: null,
    is_active: row.is_active,
    created_at: MOCK_TIMESTAMP,
    category: MOCK_CATEGORY,
  }));
}
