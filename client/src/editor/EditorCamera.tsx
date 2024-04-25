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
  useControlEventListeners();
  const { setCamera, setZoom, cameraX, cameraY, zoom } = useEditor();

  useEffect(() => {
    const wheelListener = (e: WheelEvent) => {
      e.preventDefault();
      setZoom(minmax(zoom + e.deltaY * 0.001, 0.1, 10));
    };
    window.addEventListener("wheel", wheelListener);
    return () => {
      window.removeEventListener("wheel", wheelListener);
    };
  }, [setZoom, zoom]);

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
