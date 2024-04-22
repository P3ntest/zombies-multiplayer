import { useApp, useTick } from "@pixi/react";
import { useContext, useEffect, useState } from "react";
import { stageContext } from "../stageContext";
import { useWindowSize } from "usehooks-ts";
import { useCurrentPlayerDirection } from "./PlayerSelf";

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

  const stageRef = useContext(stageContext);
  const app = useApp();
  const screen = useWindowSize();

  useEffect(() => {
    stageRef?.levelContainer?.pivot.set(x, y);
    stageRef?.levelContainer?.position.set(screen.width / 2, screen.height / 2);
  }, [
    x,
    y,
    stageRef,
    app.renderer.width,
    app.renderer.height,
    screen.height,
    screen.width,
  ]);

  return null;
}
