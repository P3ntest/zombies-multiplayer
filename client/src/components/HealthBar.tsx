import { Container, Graphics, Text } from "@pixi/react";
import type { Graphics as G } from "@pixi/graphics";
import { useCallback } from "react";
import { TextStyle } from "pixi.js";
import { useLerped } from "../lib/useLerped";

export function HealthBar({
  health,
  maxHealth = 100,
}: {
  health: number;
  maxHealth: number;
}) {
  const lerpedHealth = useLerped(health, 0.3);

  const draw = useCallback(
    (g: G) => {
      g.beginFill(0xff0000);
      g.drawRect(0, 0, 100, 10);
      g.endFill();

      g.beginFill(0x00ff00);
      const healthRel = (lerpedHealth / maxHealth) * 100;
      g.drawRect(0, 0, healthRel, 10);
      g.endFill();
    },
    [lerpedHealth, maxHealth]
  );

  if (health >= maxHealth) {
    return null;
  }

  return (
    <Container>
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
      <Text
        anchor={{
          x: 0.5,
          y: 0.5,
        }}
        position={{
          x: 0,
          y: 1,
        }}
        text={`${Math.round(health)} / ${Math.round(maxHealth)}`}
        //
        style={
          new TextStyle({
            fontSize: 10,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
        }
      />
    </Container>
  );
}
