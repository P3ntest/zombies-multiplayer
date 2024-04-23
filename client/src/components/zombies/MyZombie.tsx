import Matter, { Body } from "matter-js";
import {
  PlayerState,
  ZombieState,
} from "../../../../server/src/rooms/schema/MyRoomState";
import { ZombieSprite } from "./Zombies";
import { useBodyRef } from "../../lib/physics/hooks";
import { useTick } from "@pixi/react";
import { useState } from "react";
import { useColyseusRoom } from "../../colyseus";
import {
  useNetworkTick,
  useRoomMessageHandler,
} from "../../lib/networking/hooks";
import { useZombieBulletHitListener } from "./zombieHooks";

import { zombieInfo } from "../../../../server/src/game/zombies";
import { useZombieLogic } from "./zombieLogic";
import { useLerpedRadian } from "../../lib/useLerped";

export function MyZombie({ zombie }: { zombie: ZombieState }) {
  const zombieType = zombieInfo[zombie.zombieType];
  const collider = useBodyRef(
    () => {
      return Matter.Bodies.circle(zombie.x, zombie.y, 40 * zombieType.size);
    },
    { tags: ["zombie"], id: zombie.id }
  );

  useZombieBulletHitListener(collider.current, zombie.id);

  const { x, y, rotation } = useZombieLogic(zombie, collider);

  const visibleRotation = useLerpedRadian(rotation, 0.03);

  return (
    <ZombieSprite
      type={zombie.zombieType}
      maxHealth={zombie.maxHealth}
      x={x}
      y={y}
      rotation={visibleRotation}
      health={zombie.health}
    />
  );
}
