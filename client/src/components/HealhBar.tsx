import { Graphics } from "@pixi/react";
import type { Graphics as G } from "@pixi/graphics";
import { useCallback } from "react";

export function HealthBar({
  health,
  maxHealth = 100,
}: {
  health: number;
  maxHealth: number;
}) {
  const draw = useCallback(
    (g: G) => {
      g.beginFill(0xff0000);
      g.drawRect(0, 0, 100, 10);
      g.endFill();

      g.beginFill(0x00ff00);
      const healthRel = (health / maxHealth) * 100;
      g.drawRect(0, 0, healthRel, 10);
      g.endFill();
    },
    [health, maxHealth]
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
