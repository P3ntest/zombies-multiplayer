import { useApp, useTick } from "@pixi/react";
import { useContext, useEffect, useState } from "react";
import { cameraContext } from "../stageContext";
import { useWindowSize } from "usehooks-ts";
import { useCurrentPlayerDirection } from "../../lib/useControls";
import { useCameraStore } from "../graphics/cameraStore";

export function SpectateControls({ x, y }: { x: number; y: number }) {
  const [realX, setRealX] = useState(x);
  const [realY, setRealY] = useState(y);

  const direction = useCurrentPlayerDirection();

  useTick((delta) => {
    setRealX((x) => x + direction.x * 3 * delta);
    setRealY((y) => y + direction.y * 3 * delta);
  });

  x = realX;
  y = realY;

  const { setPosition, setZoom } = useCameraStore();

  useEffect(() => {
    setPosition(x, y);
    setZoom(0.5);
  }, [x, y, setPosition]);

  return null;
}
