import { create } from "zustand";
import {
  GameLevel,
  MapObject,
} from "./../../../server/src/game/mapEditor/editorTypes";
import { produce } from "immer";
import { persist } from "zustand/middleware";
import * as lodash from "lodash";
interface MapEditorStore {
  level: GameLevel;
  updateObject: (
    id: string,
    asset: Partial<MapObject>,
    capture?: boolean
  ) => void;
  addObject: (asset: MapObject) => void;
  deleteObject: (id: string) => void;
  resetLevel: () => void;
  loadLevel: (level: GameLevel) => void;

  changeHistory: GameLevel[];
  undo: () => void;

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
      updateObject: (id, asset, capture = true) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            const index = draft.level.objects.findIndex((o) => o.id === id);
            if (index === -1) return;
            draft.level.objects[index] = {
              ...draft.level.objects[index],
              ...asset,
            } as MapObject;

            if (capture) {
              draft.changeHistory.push(lodash.cloneDeep(state.level));
            }
          });
        }),
      addObject: (asset) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            draft.level.objects.push(asset);
            draft.changeHistory.push(lodash.cloneDeep(draft.level));
          });
        }),
      deleteObject: (id) =>
        set((state) => {
          // with immer
          return produce(state, (draft) => {
            const index = draft.level.objects.findIndex((o) => o.id === id);
            if (index === -1) return;
            draft.level.objects.splice(index, 1);
            draft.changeHistory.push(lodash.cloneDeep(draft.level));
          });
        }),

      resetLevel: () =>
        set({
          level: {
            objects: [],
          },
        }),
      loadLevel: (level) => set({ level }),

      changeHistory: [],
      undo: () =>
        set((state) => {
          return produce(state, (draft) => {
            console.log(draft.changeHistory);
            if (draft.changeHistory.length === 0) return;
            // find the first that is different with lodash isEqual
            const index = draft.changeHistory.findIndex((h) => {
              return !lodash.isEqual(h, draft.level);
            });
            if (index === -1) return;
            draft.level = lodash.cloneDeep(draft.changeHistory[index]);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).exportMap = () => {
  console.log(JSON.stringify(useEditor.getState().level));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(window as any).importMap = (level: string) => {
  useEditor.getState().loadLevel(JSON.parse(level));
};
