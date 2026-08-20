import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WishlistItem = {
  productId: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

type WishlistState = {
  items: WishlistItem[];
  has: (productId: string) => boolean;
  toggle: (item: WishlistItem) => void;
};

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      has: (productId) => get().items.some((item) => item.productId === productId),
      toggle: (item) => {
        set((state) => {
          const exists = state.items.some((row) => row.productId === item.productId);
          return {
            items: exists
              ? state.items.filter((row) => row.productId !== item.productId)
              : [...state.items, item],
          };
        });
      },
    }),
    { name: "elimarket-wishlist" },
  ),
);
