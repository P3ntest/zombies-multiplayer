import { useEffect } from "react";
import { create } from "zustand";

interface ControlsStore {
  keysDown: Set<string>;
  onKeydown: (key: string) => void;
  onKeyup: (key: string) => void;
}

export const useControlsStore = create<ControlsStore>((set) => ({
  keysDown: new Set(),
  onKeydown: (key) =>
    set((state) => ({ keysDown: new Set(state.keysDown).add(key) })),
  onKeyup: (key) =>
    set((state) => {
      const keysDown = new Set(state.keysDown);
      keysDown.delete(key);
      return { keysDown };
    }),
}));

export function useControlEventListeners() {
  const { onKeydown, onKeyup } = useControlsStore();
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      const key = event.key;
      onKeydown(key);
    };
    const keyupListener = (event: KeyboardEvent) => {
      const key = event.key;
      onKeyup(key);
    };
    window.addEventListener("keydown", keydownListener);
    window.addEventListener("keyup", keyupListener);
    return () => {
      window.removeEventListener("keydown", keydownListener);
      window.removeEventListener("keyup", keyupListener);
    };
  }, [onKeydown, onKeyup]);
}

export function useAxis() {
  const keysDown = useControlsStore((state) => state.keysDown);

  const x = (keysDown.has("d") ? 1 : 0) + (keysDown.has("a") ? -1 : 0);
  const y = (keysDown.has("s") ? 1 : 0) + (keysDown.has("w") ? -1 : 0);

  return { x, y };
}
