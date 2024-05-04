import { ZombieState } from "../../../../server/src/rooms/schema/MyRoomState";
import { ZombieSprite } from "./Zombies";
import { useZombieBulletHitListener } from "./zombieHooks";

import { useZombieLogic } from "./zombieLogic";
import { useLerpedRadian } from "../../lib/useLerped";
import { useZombieColliders } from "./zombieColliders";

export function MyZombie({ zombie }: { zombie: ZombieState }) {
  const colliders = useZombieColliders(zombie.zombieType, zombie.x, zombie.y);

  useZombieBulletHitListener(colliders.hitBox.current, zombie.id);

  const { x, y, rotation } = useZombieLogic(zombie, colliders.collider);

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
