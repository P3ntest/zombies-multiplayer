import { AnimatedSprite, Container, Graphics, Text } from "@pixi/react";
import { EntityShadow } from "../Shadow";
import { HealthBar } from "../HealthBar";
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
  maxHealth,
  velocityX,
  velocityY,
  playerClass,
  name,
  currentAnimation,
}: {
  x: number;
  y: number;
  rotation: number;
  health?: number;
  maxHealth?: number;
  velocityX: number;
  velocityY: number;
  playerClass: PlayerClass;
  name: string;
  currentAnimation: number;
}) {
  const isWalking = velocityX !== 0 || velocityY !== 0;

  const animation: PlayerAnimation =
    currentAnimation == 0 ? (isWalking ? "walk" : "idle") : "melee";
  const gun: PlayerGun = gunFromClass[playerClass];

  return (
    <Container x={x} y={y}>
      <EntityShadow radius={40} />
      <Container rotation={rotation}>
        <Feet rotation={rotation} velocityX={velocityX} velocityY={velocityY} />
        <AnimatedSprite
          key={gun + animation}
          textures={playerAnimationSprites[gun][animation].frames}
          animationSpeed={playerAnimationSprites[gun][animation].animationSpeed}
          isPlaying
          scale={{ x: 0.5, y: 0.5 }}
          anchor={{ x: gun === "pistol" ? 0.45 : 0.35, y: 0.55 }}
        />
      </Container>
      {health ? (
        <Container y={50}>
          <HealthBar health={health} maxHealth={maxHealth ? maxHealth : 100} />
        </Container>
      ) : null}
      <NameTag name={name} />
    </Container>
  );
}

function NameTag({ name }: { name: string }) {
  const width = name.length * 13;
  return (
    <Container y={-50}>
      <Graphics
        draw={(g) => {
          g.clear();
          g.beginFill(0x000000, 0.2);
          g.drawRect(-width / 2, -10, width, 20);
          g.endFill();
        }}
      />
      <Text
        alpha={0.7}
        anchor={{ x: 0.5, y: 0.5 }}
        text={name.toUpperCase()}
        style={
          new TextStyle({
            fill: "white",
            fontSize: 20,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          }) as any
        }
      />
    </Container>
  );
}

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
      <AnimatedSprite
        key={direction}
        isPlaying
        anchor={{ x: 0.5, y: 0.5 }} // centered on his head
        scale={{ x: 0.5, y: 0.5 }}
        textures={feetAnimations[direction].frames}
        animationSpeed={
          feetAnimations[direction].animationSpeed * (backwards ? -1 : 1)
        }
      />
    </>
  );
}
