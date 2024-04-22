import { AnimatedSprite, Container, Graphics, Text } from "@pixi/react";
import { EntityShadow } from "../Shadow";
import { HealthBar } from "../HealhBar";
import {
  PlayerAnimation,
  PlayerGun,
  feetAnimations,
  playerAnimationSprites,
} from "../../assets/spritesheets/playerAnimationAtlas";
import { PlayerClass } from "../../../../server/src/game/player";
import { TextStyle } from "pixi.js";

const gunFromClass: Record<PlayerClass, PlayerGun> = {
  pistol: "pistol",
  shotgun: "shotgun",
  rifle: "rifle",
  melee: "knife",
};

export function PlayerSprite({
  x,
  y,
  rotation,
  health,
  velocityX,
  velocityY,
  playerClass,
  name,
}: {
  x: number;
  y: number;
  rotation: number;
  health?: number;
  velocityX: number;
  velocityY: number;
  playerClass: PlayerClass;
  name: string;
}) {
  const isWalking = velocityX !== 0 || velocityY !== 0;

  const animation: PlayerAnimation = isWalking ? "walk" : "idle";
  const gun: PlayerGun = gunFromClass[playerClass];

  const commonProps = {
    isPlaying: true,
    scale: { x: 0.5, y: 0.5 },
    anchor: { x: 0.3, y: 0.58 }, // centered on his head
  };

  return (
    <Container x={x} y={y}>
      <EntityShadow radius={40} />
      <Container rotation={rotation}>
        <Feet rotation={rotation} velocityX={velocityX} velocityY={velocityY} />
        {PlayerGun.flatMap((_gun) =>
          PlayerAnimation.flatMap((_animation) => (
            <AnimatedSprite
              key={_gun + _animation}
              alpha={_gun === gun && _animation === animation ? 1 : 0}
              images={playerAnimationSprites[_gun][_animation].frames}
              animationSpeed={
                playerAnimationSprites[_gun][_animation].animationSpeed
              }
              {...commonProps}
            />
          ))
        )}
      </Container>
      {health ? (
        <Container y={50}>
          <HealthBar health={health} maxHealth={100} />
        </Container>
      ) : null}
      {/* <NameTag name={name} /> */}
    </Container>
  );
}

// function NameTag({ name }: { name: string }) {
//   return (
//     <Container y={-50}>
//       <Graphics
//         draw={(g) => {
//           g.beginFill(0x000000, 0.2);
//           g.drawRect(-50, -10, 100, 20);
//           g.endFill();
//         }}
//       />
//       <Text
//         anchor={{ x: 0.5, y: 0.5 }}
//         text={name}
//         style={
//           new TextStyle({
//             fill: "white",
//             // eslint-disable-next-line @typescript-eslint/no-explicit-any
//           }) as any
//         }
//       />
//     </Container>
//   );
// }

function Feet({
  rotation,
  velocityX,
  velocityY,
}: {
  rotation: number;
  velocityX: number;
  velocityY: number;
}) {
  const isWalking = velocityX !== 0 || velocityY !== 0;

  let direction: keyof typeof feetAnimations = "idle";
  let backwards = false;
  if (isWalking) {
    // calculate the angle between the player rotation and the direction he's walking
    const angle = Math.atan2(velocityY, velocityX);
    const angleDiff = angle - rotation;
    const angleDiffDeg = (angleDiff * 180) / Math.PI;

    if (angleDiffDeg > 45 && angleDiffDeg < 135) {
      direction = "strafe_left";
    } else if (angleDiffDeg < -45 && angleDiffDeg > -135) {
      direction = "strafe_right";
    } else {
      direction = "run";
      backwards = angleDiffDeg > 135 || angleDiffDeg < -135;
    }
  }

  return (
    <>
      {Object.entries(feetAnimations).map(([key, animation]) => (
        <AnimatedSprite
          key={key}
          alpha={key === direction ? 1 : 0}
          isPlaying
          anchor={{ x: 0.3, y: 0.58 }} // centered on his head
          scale={{ x: 0.5, y: 0.5 }}
          images={animation.frames as string[]}
          animationSpeed={animation.animationSpeed * (backwards ? -1 : 1)}
        />
      ))}
    </>
  );
}
