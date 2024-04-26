import { useEditor } from "./mapEditorStore";
import { useWindowSize } from "usehooks-ts";
import { Container as PIXIContainer } from "pixi.js";
import { useTick, Container } from "@pixi/react";
import { ReactNode, useEffect, useRef } from "react";
import {
  useControlEventListeners,
  useCurrentPlayerDirection,
} from "../lib/useControls";
import { GenericCamera } from "../components/graphics/Camera";

export function EditorControls() {
  useControlEventListeners(false);
  const zoom = useEditor((state) => state.zoom);
  const { setCamera, cameraX, cameraY, undo } = useEditor();

  useEffect(() => {
    const wheelListener = (e: WheelEvent) => {
      e.preventDefault();
      useEditor
        .getState()
        .setZoom(minmax(useEditor.getState().zoom + e.deltaY * 0.001, 0.1, 10));
    };
    window.addEventListener("wheel", wheelListener);
    console.log("wheel listener added");
    return () => {
      console.log("wheel listener removed");
      window.removeEventListener("wheel", wheelListener);
    };
  }, []);

  useEffect(() => {
    const keyDownListener = (e: KeyboardEvent) => {
      // undo
      if (e.key === "z" && e.ctrlKey) {
        e.preventDefault();
        undo();
      }
    };
    window.addEventListener("keydown", keyDownListener);
    return () => {
      window.removeEventListener("keydown", keyDownListener);
    };
  }, [undo]);

  const dir = useCurrentPlayerDirection(10);

  const SPEED = 5 / zoom / 2;

  useTick((delta) => {
    setCamera(cameraX + dir.x * delta * SPEED, cameraY + dir.y * delta * SPEED);
  });

  return null;
}

export function EditorCamera({ children }: { children: ReactNode }) {
  const props = useEditor((state) => ({
    x: state.cameraX,
    y: state.cameraY,
    zoom: state.zoom,
  }));

  return <GenericCamera {...props}>{children}</GenericCamera>;
}

function minmax(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
