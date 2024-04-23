import { create } from "zustand";
import { persist } from "zustand/middleware";

interface soundStore {
  volume: number;
  setVolume: (volume: number) => void;
}

export const useVolumeStore = create(
  persist<soundStore>(
    (set) => ({
      volume: 1,
      setVolume: (volume: number) => set({ volume }),
    }),
    {
      name: "volumeStore",
    }
  )
);
