export type UserRole = "customer" | "admin" | "rider";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type FailedDeliveryReason =
  | "customer_absent"
  | "no_answer"
  | "wrong_address"
  | "customer_refused"
  | "other";

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
  avatar_url: string | null;
  avatar_blur_hash: string | null;
  created_at: string;
};

/** Oman rider KYC — civil_id is رقم مدني (Civil Number) */
export type RiderProfile = {
  profile_id: string;
  first_name: string;
  last_name: string;
  civil_id: string;
  phone: string;
  address_line: string;
  created_at: string;
  updated_at: string;
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
  label_fa: string | null;
  label_ar: string | null;
  label_en: string | null;
  value_fa: string | null;
  value_ar: string | null;
  value_en: string | null;
  sort_order: number;
  created_at: string;
};

export type ProductFeatureInput = {
  label_fa: string;
  label_ar: string;
  label_en: string;
  value_fa: string;
  value_ar: string;
  value_en: string;
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

export type CampaignType = "percent" | "fixed";

export type CampaignProduct = {
  campaign_id: string;
  product_id: string;
  sale_price: number | null;
};

export type Campaign = {
  id: string;
  name: string;
  slug: string;
  type: CampaignType;
  discount_value: number;
  starts_at: string;
  ends_at: string;
  is_active: boolean;
  show_on_home: boolean;
  badge: string | null;
  banner_image_url: string | null;
  banner_blur_hash: string | null;
  created_at: string;
  products?: CampaignProduct[];
};

export type ProductCampaign = Pick<
  Campaign,
  "id" | "name" | "slug" | "type" | "discount_value" | "starts_at" | "ends_at" | "show_on_home" | "badge"
>;

export type Product = {
  id: string;
  category_id: string | null;
  brand_id: string | null;
  name: string;
  name_fa: string | null;
  name_ar: string | null;
  name_en: string | null;
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
  sku: string | null;
  parent_product_id: string | null;
  variant_label: string | null;
  category?: Category | null;
  brand?: Brand | null;
  features?: ProductFeature[];
  images?: ProductImage[];
  campaign?: ProductCampaign | null;
};

export type ProductVariantOption = {
  id: string;
  slug: string;
  variant_label: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  currency: string;
};

export type ProductReview = {
  id: string;
  product_id: string;
  user_id: string;
  reviewer_name: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type ProductQuestion = {
  id: string;
  product_id: string;
  user_id: string;
  asker_name: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  created_at: string;
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
  /** Tabs + frequently-bought block on product detail pages */
  show_product_detail_extras: boolean;
  /** Amount added to the invoice total when the customer pays cash on delivery. */
  cash_surcharge: number;
  updated_at: string;
  hero_badge: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_label: string | null;
  hero_cta_href: string | null;
  hero_image_url: string | null;
  hero_blur_hash: string | null;
  /** Store identity printed on the order receipt handed to the rider. */
  receipt_store_name_fa: string | null;
  receipt_store_name_ar: string | null;
  receipt_store_name_en: string | null;
  receipt_store_address_fa: string | null;
  receipt_store_address_ar: string | null;
  receipt_store_address_en: string | null;
  receipt_store_phone: string | null;
  receipt_footer_fa: string | null;
  receipt_footer_ar: string | null;
  receipt_footer_en: string | null;
};

export type HeroBanner = {
  id: string;
  /** Legacy single-value copy — kept as a fallback behind the per-language columns. */
  badge: string | null;
  title: string | null;
  subtitle: string | null;
  cta_label: string | null;
  badge_fa: string | null;
  badge_ar: string | null;
  badge_en: string | null;
  title_fa: string | null;
  title_ar: string | null;
  title_en: string | null;
  subtitle_fa: string | null;
  subtitle_ar: string | null;
  subtitle_en: string | null;
  cta_label_fa: string | null;
  cta_label_ar: string | null;
  cta_label_en: string | null;
  cta_href: string;
  image_url: string | null;
  blur_hash: string | null;
  image_url_ltr: string | null;
  blur_hash_ltr: string | null;
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
  /** Cash-on-delivery surcharge included in `total` (0 for online / no fee). */
  cash_fee?: number;
  currency: string;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  delivery_slot: string | null;
  address_id: string | null;
  rider_id: string | null;
  store_id: string | null;
  stock_restored?: boolean;
  picked_up_at?: string | null;
  delivered_photo_path?: string | null;
  failed_delivery_reason?: FailedDeliveryReason | null;
  failed_delivery_note?: string | null;
  failed_delivery_photo_path?: string | null;
  failed_delivery_at?: string | null;
  created_at: string;
  order_items?: OrderItem[];
  address?: Address | null;
  customer?: Pick<Profile, "id" | "full_name" | "phone"> | null;
};

export type AdminNotification = {
  id: string;
  recipient_id: string;
  type: string;
  title: string;
  body: string;
  order_id: string | null;
  read_at: string | null;
  created_at: string;
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
