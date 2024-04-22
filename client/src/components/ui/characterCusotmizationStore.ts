import { create } from "zustand";
import { PlayerClass } from "../../../../server/src/game/player";

interface CharacterCustomizationStore {
  selectedClass: PlayerClass;
  setSelectedClass: (playerClass: PlayerClass) => void;
  name: string;
  setName: (name: string) => void;
}

export const useCharacterCustomizationStore =
  create<CharacterCustomizationStore>((set) => ({
    selectedClass: "pistol",
    setSelectedClass: (playerClass: PlayerClass) =>
      set({ selectedClass: playerClass }),
    name: "",
    setName: (name: string) => set({ name }),
  }));
