import { Container, Graphics, Text } from "@pixi/react";
import type { Graphics as G } from "@pixi/graphics";
import { useCallback } from "react";
import { TextStyle } from "pixi.js";

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

  // if (health === 100) return null;

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
        text={`${health} / ${maxHealth}`}
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
