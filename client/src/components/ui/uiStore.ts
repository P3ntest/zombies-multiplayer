import { create } from "zustand";

interface UIStore {
  buyMenuOpen: boolean;
  setBuyMenuOpen: (buyMenuOpen: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  buyMenuOpen: false,
  setBuyMenuOpen: (buyMenuOpen: boolean) => set({ buyMenuOpen }),
}));
