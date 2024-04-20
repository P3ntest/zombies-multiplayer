import { create } from "zustand";

interface GameStore {
  mouseX: number;
  mouseY: number;
  setMousePosition: (x: number, y: number) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  mouseX: 0,
  mouseY: 0,
  setMousePosition: (x, y) => set({ mouseX: x, mouseY: y }),
}));
