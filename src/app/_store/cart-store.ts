import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/app/_types/database.types";

type CartState = {
  items: CartItem[];
  isSyncing: boolean;
  setSyncing: (syncing: boolean) => void;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isSyncing: false,
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      addItem: (item, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          const maxStock = item.stock ?? existing?.stock ?? Number.POSITIVE_INFINITY;
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + quantity, maxStock),
                      blurHash: i.blurHash ?? item.blurHash,
                      stock: item.stock ?? i.stock,
                    }
                  : i,
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...item, quantity: Math.min(quantity, maxStock) },
            ],
          };
        });
      },
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => {
            if (i.productId !== productId) return i;
            const maxStock = i.stock ?? Number.POSITIVE_INFINITY;
            return { ...i, quantity: Math.min(quantity, maxStock) };
          }),
        }));
      },
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "elimarket-cart" },
  ),
);
