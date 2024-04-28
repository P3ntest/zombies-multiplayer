import { useEditor } from "./mapEditorStore";
import { useApp, useTick } from "@pixi/react";
import { ReactNode, useEffect } from "react";
import {
  useControlEventListeners,
  useCurrentPlayerDirection,
} from "../lib/useControls";
import { GenericCamera } from "../components/graphics/Camera";

export function EditorControls() {
  useControlEventListeners(false);
  const zoom = useEditor((state) => state.zoom);
  const setCamera = useEditor((state) => state.setCamera);
  const cameraX = useEditor((state) => state.cameraX);
  const cameraY = useEditor((state) => state.cameraY);
  // const app = useApp();

  useEffect(() => {
    const wheelListener = (e: WheelEvent) => {
      useEditor
        .getState()
        .setZoom(minmax(useEditor.getState().zoom + e.deltaY * 0.001, 0.1, 10));
    };
    window.addEventListener("wheel", wheelListener);
    return () => {
      window.removeEventListener("wheel", wheelListener);
    };
  }, []);

  const dir = useCurrentPlayerDirection(10);

  const SPEED = 5 / zoom / 2;

  useTick((delta) => {
    setCamera(cameraX + dir.x * delta * SPEED, cameraY + dir.y * delta * SPEED);
  });

  return null;
}

export function EditorCamera({ children }: { children: ReactNode }) {
  const x = useEditor((state) => state.cameraX);
  const y = useEditor((state) => state.cameraY);
  const zoom = useEditor((state) => state.zoom);

  return (
    <GenericCamera x={x} y={y} zoom={zoom} lerp={0.2}>
      {children}
    </GenericCamera>
  );
}

function minmax(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
