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

export function useMouseDown(callback: (event: MouseEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent) => {
      callback(event);
    };
    window.addEventListener("mousedown", listener);
    return () => {
      window.removeEventListener("mousedown", listener);
    };
  }, [callback]);
}

export function useIsKeyDown(key: string) {
  const isMouseDown = useControlsStore((state) => state.keysDown.has(key));
  return isMouseDown;
}

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

    const mouseDownListener = (event: MouseEvent) => {
      const key = event.button === 0 ? "mouse0" : "mouse1";
      onKeydown(key);
    };
    const mouseUpListener = (event: MouseEvent) => {
      const key = event.button === 0 ? "mouse0" : "mouse1";
      onKeyup(key);
    };
    window.addEventListener("mousedown", mouseDownListener);
    window.addEventListener("mouseup", mouseUpListener);

    return () => {
      window.removeEventListener("keydown", keydownListener);
      window.removeEventListener("keyup", keyupListener);
      window.removeEventListener("mousedown", mouseDownListener);
      window.removeEventListener("mouseup", mouseUpListener);
    };
  }, [onKeydown, onKeyup]);
}

export function useAxis() {
  const keysDown = useControlsStore((state) => state.keysDown);

  const x = (keysDown.has("d") ? 1 : 0) + (keysDown.has("a") ? -1 : 0);
  const y = (keysDown.has("s") ? 1 : 0) + (keysDown.has("w") ? -1 : 0);

  return { x, y };
}
