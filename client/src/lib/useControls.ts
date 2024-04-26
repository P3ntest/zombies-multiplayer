import { useEffect } from "react";
import { create } from "zustand";
import { useUIStore } from "../components/ui/uiStore";

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

export function useControlEventListeners(preventTab = true) {
  const { onKeydown, onKeyup } = useControlsStore();
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => {
      if (event.key == "Tab" && preventTab) event.preventDefault();
      const key = event.key.toLowerCase();
      onKeydown(key);
    };
    const keyupListener = (event: KeyboardEvent) => {
      if (event.key == "Tab" && preventTab) event.preventDefault();
      const key = event.key.toLowerCase();
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
  }, [onKeydown, onKeyup, preventTab]);
}

export function useAxis() {
  const keysDown = useControlsStore((state) => state.keysDown);

  const x = (keysDown.has("d") ? 1 : 0) + (keysDown.has("a") ? -1 : 0);
  const y = (keysDown.has("s") ? 1 : 0) + (keysDown.has("w") ? -1 : 0);

  return { x, y };
}

export function useCurrentPlayerDirection(speed = 4) {
  const chatOpen = useUIStore((state) => state.chatOpen);
  const axis = useAxis();

  if (chatOpen) {
    return { x: 0, y: 0 };
  }

  const speedX = axis.x;
  const speedY = axis.y;

  const mag = Math.sqrt(speedX ** 2 + speedY ** 2);

  if (mag === 0) {
    return { x: 0, y: 0 };
  }

  const normalizedX = (speedX / mag) * speed;
  const normalizedY = (speedY / mag) * speed;

  return {
    x: normalizedX,
    y: normalizedY,
  };
}
