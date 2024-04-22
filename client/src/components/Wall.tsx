import { Bodies } from "matter-js";
import { useBodyRef } from "../lib/physics/hooks";
import { TilingSprite } from "@pixi/react";

export function Wall({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  useBodyRef(() => Bodies.rectangle(x, y, width, height, { isStatic: true }), {
    tags: ["destroyBullet"],
  });

  return (
    <TilingSprite
      tilePosition={{
        x: 0,
        y: 0,
      }}
      x={x}
      y={y}
      anchor={{ x: 0.5, y: 0.5 }}
      width={width}
      height={height}
      image="/assets/sandwall.jpeg"
    />
  );
}
