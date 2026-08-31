import { create } from "zustand";
import { persist } from "zustand/middleware";

type LocationState = {
  /**
   * `slug` of the delivery area the shopper picked, or `null` when they haven't chosen one
   * yet (guest on first visit, no persisted selection). The UI must show a "select your area"
   * prompt for `null` rather than assuming a default area. Areas themselves are managed in the
   * admin panel (`delivery_areas` table) and fetched via `getDeliveryAreasAction`.
   */
  selectedAreaSlug: string | null;
  setArea: (slug: string) => void;
  clearArea: () => void;
};

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      selectedAreaSlug: null,
      setArea: (slug) => set({ selectedAreaSlug: slug }),
      clearArea: () => set({ selectedAreaSlug: null }),
    }),
    {
      name: "elimarket-location",
      // v1: field renamed from `selectedAreaKey` (i18n key) to `selectedAreaSlug` (DB slug).
      version: 1,
      migrate: () => ({ selectedAreaSlug: null }),
    },
  ),
);
