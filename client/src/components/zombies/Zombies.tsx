import { ParticleContainer, Sprite, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { ZombieState } from "../../../../server/src/rooms/schema/MyRoomState";
import { MyZombie } from "./MyZombie";
import { useLerped, useLerpedRadian } from "../../lib/useLerped";
import { useBodyRef } from "../../lib/physics/hooks";
import Matter, { Body } from "matter-js";
import { ComponentProps } from "react";

export function Zombies() {
  const state = useColyseusState();
  const zombies = state?.zombies;
  return (
    <ParticleContainer>
      {zombies?.map((zombie) => (
        <Zombie key={zombie.id} zombie={zombie} />
      ))}
    </ParticleContainer>
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
  const x = useLerped(zombie.x, 0.1);
  const y = useLerped(zombie.y, 0.1);
  const rotation = useLerpedRadian(zombie.rotation, 0.1);

  useTick(() => {
    Body.setPosition(collider.current, {
      x,
      y,
    });
  });

  return <ZombieSprite x={x} y={y} rotation={rotation} />;
}

export function ZombieSprite({
  x,
  y,
  rotation,
  ...other
}: {
  x: number;
  y: number;
  rotation: number;
} & ComponentProps<typeof Sprite>) {
  return (
    <Sprite
      x={x}
      y={y}
      rotation={rotation}
      image={"assets/zombie.gif"}
      scale={{ x: 0.5, y: 0.5 }}
      anchor={{ x: 0.3, y: 0.58 }}
      {...other}
    />
  );
}
