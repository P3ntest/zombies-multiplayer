import { ReactNode, useRef } from "react";
import { useCameraStore } from "./cameraStore";
import { useWindowSize } from "usehooks-ts";
import { Container, useTick } from "@pixi/react";
import { CameraProvider } from "../stageContext";
import { Container as PIXIContainer } from "pixi.js";

export function GameCamera({ children }: { children: ReactNode }) {
  const windowSize = useWindowSize();
  const maxAxis = Math.max(windowSize.width, windowSize.height);
  const zoom = (maxAxis / 1920) * 1.2 * useCameraStore((state) => state.zoom);
  return (
    <GenericCamera {...useCameraStore()} zoom={zoom}>
      {children}
    </GenericCamera>
  );
}

export function GenericCamera({
  x,
  y,
  zoom,
  children,
}: {
  x: number;
  y: number;
  zoom: number;
  children: ReactNode;
}) {
  const windowSize = useWindowSize();
  const scale = zoom;

  const camRef = useRef<PIXIContainer>(null);

  const currentTarget = useRef({ x: 0, y: 0 });
  const currentScale = useRef(1);

  useTick(() => {
    const cam = camRef.current;

    if (!cam) return;

    // stageRef?.levelContainer?.pivot.set(x, y);
    // stageRef?.levelContainer?.position.set(screen.width / 2, screen.height / 2);

    const LERP = 0.04;

    currentTarget.current.x =
      currentTarget.current.x + (x - currentTarget.current.x) * LERP;
    currentTarget.current.y =
      currentTarget.current.y + (y - currentTarget.current.y) * LERP;

    currentScale.current =
      currentScale.current + (scale - currentScale.current) * 0.1;

    cam.pivot.set(currentTarget.current.x, currentTarget.current.y);
    cam.position.set(windowSize.width / 2, windowSize.height / 2);
    cam.scale.set(currentScale.current);
  });

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <Container x={x} y={y} scale={{ x: zoom, y: zoom }} ref={camRef}>
      <CameraProvider value={{ camera: camRef.current }}>
        {children}
      </CameraProvider>
    </Container>
  );
}
