import type { LucideIcon } from "lucide-react";
import {
  Beef,
  CupSoda,
  Leaf,
  Milk,
  Package,
  ShoppingBasket,
  Wheat,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  dairy: Milk,
  produce: Leaf,
  beverages: CupSoda,
  meat: Beef,
  bakery: Wheat,
  default: ShoppingBasket,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICON_MAP[slug] ?? CATEGORY_ICON_MAP.default;
}
