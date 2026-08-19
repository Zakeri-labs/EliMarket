import type { Order, OrderStatus } from "@/app/_types/database.types";
import type { Locale } from "@/i18n/config";
import { mockProductDetail } from "@/app/(storefront)/_mocks/product-mock";

const MOCK_TIMESTAMP = "2024-01-15T10:30:00.000Z";

const ORDER_IDS = [
  "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "d4e5f6a7-b8c9-0123-def0-234567890123",
];

const STATUSES: OrderStatus[] = ["pending", "confirmed", "preparing", "out_for_delivery"];

const TOTALS = [485_000, 312_000, 756_000, 198_000];

/** Typical admin orders page (4 cards). */
export const MOCK_ADMIN_ORDER_COUNT = ORDER_IDS.length;

export function mockAdminOrders(locale: Locale): Order[] {
  const product = mockProductDetail(locale);

  return ORDER_IDS.map((id, index) => ({
    id,
    user_id: "mock-user-id",
    status: STATUSES[index] ?? "pending",
    total: TOTALS[index] ?? 250_000,
    currency: "IRR",
    payment_method: "cash" as const,
    delivery_slot: "10:00 - 12:00",
    address_id: "mock-address-id",
    rider_id: null,
    store_id: null,
    created_at: MOCK_TIMESTAMP,
    order_items: [
      {
        id: `mock-order-item-${index}`,
        order_id: id,
        product_id: product.id,
        quantity: 2,
        unit_price: Math.round((TOTALS[index] ?? 250_000) / 2),
        product,
      },
    ],
  }));
}

export function mockAdminOrderIdPreview(locale: Locale): string {
  return `${mockAdminOrders(locale)[0]?.id.slice(0, 8) ?? "a1b2c3d4"}…`;
}

export function mockAdminOrderDateLabel(locale: Locale): string {
  const sample = new Date(MOCK_TIMESTAMP).toLocaleString(
    locale === "fa" ? "fa-IR" : locale === "ar" ? "ar-OM" : "en-OM",
  );
  return sample;
}
