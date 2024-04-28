import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ClientSettingsStore {
  volume: number;
  setVolume: (volume: number) => void;

  showFps: boolean;
  setShowFps: (showFps: boolean) => void;
}

export const useClientSettings = create(
  persist<ClientSettingsStore>(
    (set) => ({
      volume: 1,
      setVolume: (volume: number) => set({ volume }),

      showFps: false,
      setShowFps: (showFps: boolean) => set({ showFps }),
    }),
    {
      name: "clientSettings",
    }
  )
);
