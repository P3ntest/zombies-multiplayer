import { Graphics } from "@pixi/react";
import { useCallback } from "react";
import type { Graphics as G } from "@pixi/graphics";

export function EntityShadow({ radius }: { radius: number }) {
  const draw = useCallback(
    (g: G) => {
      g.beginFill(0x000000, 0);
      g.drawCircle(0, 0, radius);
      g.endFill();
    },
    [radius]
  );
  return <Graphics draw={draw} x={10} y={10} />;
}
