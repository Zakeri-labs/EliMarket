export const BRAND_NAME = "EliMarket";
export const BRAND_NAME_FA = "EliMarket";

export const DEFAULT_CURRENCY = "OMR";
export const FREE_DELIVERY_THRESHOLD = 10;
export const DELIVERY_FEE = 0.5;
export const VAT_RATE = 0.05;
export const MONEY_SCALE = 1000;

import { getNumberLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function roundMoney(amount: number) {
  return Math.round(amount * MONEY_SCALE) / MONEY_SCALE;
}

export function toMinorUnits(amount: number) {
  return Math.round(amount * MONEY_SCALE);
}

export function cartTotals(subtotal: number) {
  const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_FEE;
  const vat = roundMoney(subtotal * VAT_RATE);
  const total = roundMoney(subtotal + deliveryFee + vat);
  return { subtotal, deliveryFee, vat, total };
}

export function formatPrice(
  amount: number,
  currency = DEFAULT_CURRENCY,
  locale: Locale = "fa",
) {
  const value = Number(amount);
  const safeAmount = Number.isFinite(value) ? value : 0;
  const safeLocale: Locale = locale === "en" || locale === "ar" ? locale : "fa";
  const fractionDigits = currency === "OMR" ? 3 : currency === "IRR" ? 0 : 2;
  const formatted = safeAmount.toLocaleString(getNumberLocale(safeLocale), {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
  const label =
    currency === "OMR" || currency === "IRR"
      ? getMessages(safeLocale).brand.currency
      : currency;
  return `${formatted} ${label}`;
}
