import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Beef,
  Cookie,
  CupSoda,
  Home,
  Leaf,
  Milk,
  Package,
  ShoppingBasket,
  Sparkles,
  Wheat,
} from "lucide-react";

export const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  dairy: Milk,
  produce: Leaf,
  beverages: CupSoda,
  meat: Beef,
  bakery: Wheat,
  snacks: Cookie,
  pantry: Package,
  "personal-care": Sparkles,
  household: Home,
  "baby-care": Baby,
  default: ShoppingBasket,
};

export function getCategoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICON_MAP[slug] ?? CATEGORY_ICON_MAP.default;
}
