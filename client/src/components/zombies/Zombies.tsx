import { Container, ParticleContainer, Sprite, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { ZombieState } from "../../../../server/src/rooms/schema/MyRoomState";
import { MyZombie } from "./MyZombie";
import { useLerped, useLerpedRadian } from "../../lib/useLerped";
import { useBodyRef } from "../../lib/physics/hooks";
import Matter, { Body } from "matter-js";
import { ComponentProps } from "react";
import { useZombieBulletHitListener } from "./zombies";
import { HealthBar } from "../HealhBar";
import { EntityShadow } from "../Shadow";

export function Zombies() {
  const state = useColyseusState();
  const zombies = state?.zombies;
  return (
    <Container>
      {zombies?.map((zombie) => (
        <Zombie key={zombie.id} zombie={zombie} />
      ))}
    </Container>
  );
}

function Zombie({ zombie }: { zombie: ZombieState }) {
  const sessionId = useColyseusRoom()?.sessionId;
  const isMe = zombie.playerId === sessionId;

  if (isMe) {
    return <MyZombie zombie={zombie} />;
  } else {
    return <OtherZombie zombie={zombie} />;
  }
}

function OtherZombie({ zombie }: { zombie: ZombieState }) {
  const collider = useBodyRef(() => {
    return Matter.Bodies.circle(zombie.x, zombie.y, 40);
  });
  useZombieBulletHitListener(collider.current, zombie.id);

  const x = useLerped(zombie.x, 0.1);
  const y = useLerped(zombie.y, 0.1);
  const rotation = useLerpedRadian(zombie.rotation, 0.1);

  useTick(() => {
    Body.setPosition(collider.current, {
      x,
      y,
    });
  });

  return (
    <ZombieSprite x={x} y={y} rotation={rotation} health={zombie.health} />
  );
}

export function ZombieSprite({
  x,
  y,
  rotation,
  health,
  ...other
}: {
  x: number;
  y: number;
  health: number;
  rotation: number;
} & ComponentProps<typeof Sprite>) {
  return (
    <Container x={x} y={y}>
      <EntityShadow radius={40} />
      <Sprite
        rotation={rotation}
        image={"assets/zombie.gif"}
        scale={{ x: 0.5, y: 0.5 }}
        anchor={{ x: 0.35, y: 0.55 }}
        {...other}
      />
      <Container y={70}>
        <HealthBar health={health} />
      </Container>
    </Container>
  );
}
