export type UserRole = "customer" | "admin" | "rider";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cash" | "online";

export type Profile = {
  id: string;
  phone: string | null;
  full_name: string | null;
  role: UserRole;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  name_fa: string | null;
  name_ar: string | null;
  name_en: string | null;
  slug: string;
  sort_order: number;
  image_url: string | null;
  blur_hash: string | null;
  created_at: string;
};

export type Brand = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductFeature = {
  id: string;
  product_id: string;
  label: string;
  value: string;
  sort_order: number;
  created_at: string;
};

export type ProductFeatureInput = {
  label: string;
  value: string;
};

export type Product = {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  description_fa: string | null;
  description_ar: string | null;
  description_en: string | null;
  price: number;
  compare_at_price: number | null;
  currency: string;
  stock: number;
  image_url: string | null;
  blur_hash: string | null;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
  brand?: Brand | null;
  features?: ProductFeature[];
};

export type Store = {
  id: string;
  name: string;
  coverage_area: unknown | null;
  created_at: string;
};

export type StoreSettings = {
  id: string;
  show_prices: boolean;
  updated_at: string;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_label: string | null;
  hero_cta_href: string | null;
  hero_image_url: string | null;
  hero_blur_hash: string | null;
};

export type Address = {
  id: string;
  user_id: string;
  label: string;
  address_line: string;
  lat: number;
  lng: number;
  is_default: boolean;
  created_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  currency: string;
  payment_method: PaymentMethod;
  delivery_slot: string | null;
  address_id: string | null;
  rider_id: string | null;
  store_id: string | null;
  created_at: string;
  order_items?: OrderItem[];
  address?: Address | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product | null;
};

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  imageUrl?: string | null;
  blurHash?: string | null;
  quantity: number;
};
