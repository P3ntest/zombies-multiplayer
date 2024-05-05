import { ReactNode, useMemo, useRef } from "react";
import { useCameraStore } from "./cameraStore";
import { useWindowSize } from "usehooks-ts";
import { Container, useTick } from "@pixi/react";
import { CameraProvider } from "../stageContext";
import { Container as PIXIContainer } from "pixi.js";

export function GameCamera({ children }: { children: ReactNode }) {
  const windowSize = useWindowSize();
  const screenSurface = windowSize.width * windowSize.height;
  const zoom =
    Math.sqrt(screenSurface / (1920 * 1080)) *
    2.2 *
    useCameraStore((state) => state.zoom);

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
  lerp = 0.04,
}: {
  x: number;
  y: number;
  zoom: number;
  children: ReactNode;
  lerp?: number;
}) {
  const windowSize = useWindowSize();
  const scale = zoom;

  const camRef = useRef<PIXIContainer>(null);

  const currentTarget = useRef({ x: 0, y: 0 });
  const currentScale = useRef(1);
  const id = useMemo(() => Math.random().toString(26), []);

  useTick(() => {
    const cam = camRef.current;

    if (!cam) return;

    // stageRef?.levelContainer?.pivot.set(x, y);
    // stageRef?.levelContainer?.position.set(screen.width / 2, screen.height / 2);

    const LERP = lerp;

    currentTarget.current.x =
      currentTarget.current.x + (x - currentTarget.current.x) * LERP;
    currentTarget.current.y =
      currentTarget.current.y + (y - currentTarget.current.y) * LERP;

    currentScale.current =
      currentScale.current + (scale - currentScale.current) * LERP;

    cam.pivot.set(currentTarget.current.x, currentTarget.current.y);
    cam.position.set(windowSize.width / 2, windowSize.height / 2);
    cam.scale.set(currentScale.current);
  });

  return (
    <Container x={x} y={y} scale={{ x: zoom, y: zoom }} ref={camRef} name={id}>
      <CameraProvider value={{ camera: camRef.current }}>
        {children}
      </CameraProvider>
    </Container>
  );
}
