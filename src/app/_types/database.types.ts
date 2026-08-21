export type UserRole = "customer" | "admin" | "rider";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type InventoryUnit = "count" | "weight" | "pack";

export type PaymentMethod = "cash" | "online";

export type PaymentStatus = "unpaid" | "pending" | "paid" | "failed" | "refunded";

export type PaymentRecordStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

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
  parent_id: string | null;
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

export type ProductImage = {
  id: string;
  product_id: string;
  image_url: string;
  blur_hash: string | null;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
};

export type ProductImageInput = {
  image_url: string;
  blur_hash?: string | null;
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
  inventory_unit: InventoryUnit;
  low_stock_threshold: number;
  image_url: string | null;
  blur_hash: string | null;
  is_active: boolean;
  created_at: string;
  category?: Category | null;
  brand?: Brand | null;
  features?: ProductFeature[];
  images?: ProductImage[];
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

export type HeroBanner = {
  id: string;
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  cta_href: string;
  image_url: string | null;
  blur_hash: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
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
  payment_status: PaymentStatus;
  delivery_slot: string | null;
  address_id: string | null;
  rider_id: string | null;
  store_id: string | null;
  stock_restored?: boolean;
  created_at: string;
  order_items?: OrderItem[];
  address?: Address | null;
  customer?: Pick<Profile, "id" | "full_name" | "phone"> | null;
};

export type Payment = {
  id: string;
  order_id: string;
  provider: string;
  provider_session_id: string | null;
  amount: number;
  currency: string;
  status: PaymentRecordStatus;
  raw_payload: unknown | null;
  created_at: string;
  updated_at: string;
  order?: Order | null;
};

export type CreateOrderResult = {
  order: Order;
  checkoutUrl: string | null;
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
  stock?: number;
};
