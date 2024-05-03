import { create } from "zustand";

interface UIStore {
  buyMenuOpen: boolean;
  setBuyMenuOpen: (buyMenuOpen: boolean) => void;

  chatOpen: boolean;
  setChatOpen: (chatOpen: boolean) => void;

  leaderboardOpen: boolean;
  setLeaderboardOpen: (leaderboardOpen: boolean) => void;

  escapeOpen: boolean;
  setEscapeOpen: (escapeOpen: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  buyMenuOpen: false,
  setBuyMenuOpen: (buyMenuOpen: boolean) => set({ buyMenuOpen }),

  chatOpen: false,
  setChatOpen: (chatOpen: boolean) => set({ chatOpen }),

  leaderboardOpen: false,
  setLeaderboardOpen: (leaderboardOpen: boolean) => set({ leaderboardOpen }),

  escapeOpen: false,
  setEscapeOpen: (escapeOpen: boolean) => set({ escapeOpen }),
}));
