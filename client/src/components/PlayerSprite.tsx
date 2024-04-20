import { Sprite } from "@pixi/react";

export function PlayerSprite({
  x,
  y,
  rotation,
}: {
  x: number;
  y: number;
  rotation: number;
}) {
  return (
    <>
      <Sprite
        image="/assets/Top_Down_Survivor/rifle/idle/survivor-idle_rifle_0.png"
        x={x}
        y={y}
        scale={{ x: 0.5, y: 0.5 }}
        anchor={{ x: 0.3, y: 0.58 }} // centered on his head
        rotation={rotation}
      />
    </>
  );
}
