import { Graphics } from "@pixi/react";
import type { Graphics as G } from "@pixi/graphics";
import { useCallback } from "react";

export function HealthBar({ health }: { health: number }) {
  const draw = useCallback(
    (g: G) => {
      g.beginFill(0xff0000);
      g.drawRect(0, 0, 100, 10);
      g.endFill();

      g.beginFill(0x00ff00);
      g.drawRect(0, 0, health, 10);
      g.endFill();
    },
    [health]
  );

  if (health === 100) return null;

  return (
    <Graphics
      anchor={{
        x: 0.5,
        y: 0.5,
      }}
      position={{
        x: -50,
        y: -5,
      }}
      draw={draw}
    />
  );
}
