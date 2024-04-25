import { create } from "zustand";
import {
  GameLevel,
  MapObject,
} from "./../../../server/src/game/mapEditor/editorTypes";
import { produce } from "immer";
import { persist } from "zustand/middleware";
interface MapEditorStore {
  level: GameLevel;
  updateObject: (id: string, asset: Partial<MapObject>) => void;
  addObject: (asset: MapObject) => void;
  deleteObject: (id: string) => void;

  selectedObject: string | null;
  setSelectedObject: (id: string | null) => void;

  zoom: number;
  cameraX: number;
  cameraY: number;
  setCamera: (x: number, y: number) => void;
  setZoom: (zoom: number) => void;
}

export const useEditor = create(
  persist<MapEditorStore>(
    (set) => ({
      level: {
        objects: [],
      },
      updateObject: (id, asset) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            const index = draft.level.objects.findIndex((o) => o.id === id);
            if (index === -1) return;
            draft.level.objects[index] = {
              ...draft.level.objects[index],
              ...asset,
            } as MapObject;
          });
        }),
      addObject: (asset) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            draft.level.objects.push(asset);
          });
        }),
      deleteObject: (id) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            const index = draft.level.objects.findIndex((o) => o.id === id);
            if (index === -1) return;
            draft.level.objects.splice(index, 1);
          });
        }),

      selectedObject: null,
      setSelectedObject: (id) => set({ selectedObject: id }),

      zoom: 1,
      cameraX: 0,
      cameraY: 0,
      setCamera: (x, y) => set({ cameraX: x, cameraY: y }),
      setZoom: (zoom) => set({ zoom }),
    }),
    {
      name: "mapEditor",
      getStorage: () => localStorage,
    }
  )
);
