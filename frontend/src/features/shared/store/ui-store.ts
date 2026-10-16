import { create } from "zustand";

type UiState = {
  mobileNavOpen: boolean;
  selectedCategory: string;
  setMobileNavOpen: (open: boolean) => void;
  setSelectedCategory: (category: string) => void;
};

export const useUiStore = create<UiState>((set) => ({
  mobileNavOpen: false,
  selectedCategory: "Semua",
  setMobileNavOpen: (open) => set({ mobileNavOpen: open }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
}));
