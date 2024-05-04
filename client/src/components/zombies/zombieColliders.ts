import { zombieInfo } from "./../../../../server/src/game/zombies";
import Matter from "matter-js";
import { ZombieType } from "../../../../server/src/game/zombies";
import { useBodyRef } from "../../lib/physics/hooks";
import { useTick } from "@pixi/react";

export function useZombieColliders(
  zombieType: ZombieType,
  initialX: number,
  initialY: number
) {
  const info = zombieInfo[zombieType];
  const hitBox = useBodyRef(
    () => {
      return Matter.Bodies.circle(initialX, initialY, 40 * info.size, {
        density: 0.003,
        isSensor: true,
      });
    },
    { tags: ["zombie"] }
  );
  const collider = useBodyRef(
    () => {
      return Matter.Bodies.circle(initialX, initialY, 30 * info.size, {
        density: 0.003,
      });
    },
    { tags: ["zombie"] }
  );

  useTick(() => {
    // move the hitBox to the collider
    Matter.Body.setPosition(hitBox.current, collider.current.position);
  });

  return { hitBox, collider };
}
