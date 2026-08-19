export const BRAND_NAME = "EliMarket";
export const BRAND_NAME_FA = "EliMarket";

export const FREE_DELIVERY_THRESHOLD = 500_000;
export const DELIVERY_FEE = 25_000;
export const VAT_RATE = 0.09;

import { getNumberLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/messages";

export function formatPrice(
  amount: number,
  currency = "IRR",
  locale: Locale = "fa",
) {
  const formatted = amount.toLocaleString(getNumberLocale(locale));
  const label =
    currency === "IRR" ? getMessages(locale).brand.currency : currency;
  return `${formatted} ${label}`;
}
