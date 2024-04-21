import { Container, Sprite } from "@pixi/react";
import { EntityShadow } from "./Shadow";
import { HealthBar } from "./HealhBar";

export function PlayerSprite({
  x,
  y,
  rotation,
  health,
}: {
  x: number;
  y: number;
  rotation: number;
  health?: number;
}) {
  return (
    <Container x={x} y={y}>
      <EntityShadow radius={40} />
      <Sprite
        image="/assets/Top_Down_Survivor/handgun/idle/survivor-idle_handgun_0.png"
        scale={{ x: 0.5, y: 0.5 }}
        anchor={{ x: 0.3, y: 0.58 }} // centered on his head
        rotation={rotation}
      />
      {health ? (
        <Container y={50}>
          <HealthBar health={health} />
        </Container>
      ) : null}
    </Container>
  );
}
