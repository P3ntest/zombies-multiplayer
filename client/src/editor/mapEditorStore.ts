import { create } from "zustand";
import { GameLevel } from "./../../../server/src/game/mapEditor/editorTypes";
interface MapEditorStore {
  level: GameLevel;

  zoom: number;
  cameraX: number;
  cameraY: number;
  setCamera: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
}

export const useEditor = create<MapEditorStore>((set) => ({
  level: {
    objects: [],
  },

  zoom: 1,
  cameraX: 0,
  cameraY: 0,
  setCamera: (x, y) => set({ cameraX: x, cameraY: y }),
  setZoom: (zoom) => set({ zoom }),
}));
