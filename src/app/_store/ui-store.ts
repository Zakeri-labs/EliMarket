import { create } from "zustand";

type UiState = {
  mobileOpen: boolean;
  sidebarOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobile: () => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileOpen: false,
  sidebarOpen: true,
  setMobileOpen: (open) => set({ mobileOpen: open }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleMobile: () => set((state) => ({ mobileOpen: !state.mobileOpen })),
}));
