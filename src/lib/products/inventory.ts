import type { InventoryUnit, Product } from "@/app/_types/database.types";

export const INVENTORY_UNITS: InventoryUnit[] = ["count", "weight", "pack"];

export const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export function productLowStockThreshold(
  product: Pick<Product, "low_stock_threshold">,
) {
  return product.low_stock_threshold ?? DEFAULT_LOW_STOCK_THRESHOLD;
}

export function isOutOfStock(product: Pick<Product, "stock">) {
  return product.stock <= 0;
}

export function isLowStock(
  product: Pick<Product, "stock" | "low_stock_threshold">,
) {
  return product.stock > 0 && product.stock <= productLowStockThreshold(product);
}

export function productInventoryUnit(
  product: Pick<Product, "inventory_unit">,
): InventoryUnit {
  return product.inventory_unit ?? "count";
}

export function inventoryUnitMessageKey(
  unit: InventoryUnit,
): "unitCount" | "unitWeight" | "unitPack" {
  if (unit === "weight") return "unitWeight";
  if (unit === "pack") return "unitPack";
  return "unitCount";
}
