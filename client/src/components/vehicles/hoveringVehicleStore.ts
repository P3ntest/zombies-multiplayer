import { create } from "zustand";

export const useHoveringVehicle = create<{
  hoveringVehicle: string | null;
  setHoveringVehicle: (hoveringVehicle: string | null) => void;
}>((set) => ({
  hoveringVehicle: null as string | null,
  setHoveringVehicle: (hoveringVehicle: string | null) =>
    set({ hoveringVehicle }),
}));
