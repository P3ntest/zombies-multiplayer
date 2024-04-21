import Matter, { use } from "matter-js";
import { ZombieState } from "../../../../server/src/rooms/schema/MyRoomState";
import { ZombieSprite } from "./Zombies";
import { useBodyRef } from "../../lib/physics/hooks";
import { useTick } from "@pixi/react";
import { useCallback, useState } from "react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useNetworkTick } from "../../lib/networking/hooks";

export function MyZombie({ zombie }: { zombie: ZombieState }) {
  const [x, setX] = useState(zombie.x);
  const [y, setY] = useState(zombie.y);
  const [rotation, setRotation] = useState(zombie.rotation);

  const room = useColyseusRoom();

  const players = useColyseusState((state) => state.players);

  const collider = useBodyRef(
    () => {
      return Matter.Bodies.circle(zombie.x, zombie.y, 40);
    },
    { tags: ["zombie"] }
  );

  useNetworkTick(() => {
    room?.send("updateZombie", {
      id: zombie.id,
      x: collider.current.position.x,
      y: collider.current.position.y,
      rotation,
    });

    if (zombie.targetPlayerId == "") {
      const playersInRange =
        Array.from(players!.entries()).filter(([, player]) => {
          const distance = Math.hypot(
            player.x - collider.current.position.x,
            player.y - collider.current.position.y
          );
          return distance < 200;
        }) ?? [];

      if (playersInRange.length > 0) {
        const targetPlayer = playersInRange[0];
        room?.send("updateZombie", {
          id: zombie.id,
          targetPlayerId: targetPlayer[0],
        });
      }
    } else {
      const targetPlayer = players?.get(zombie.targetPlayerId);
      if (!targetPlayer) {
        console.warn("target player not found, resetting target");
        room?.send("updateZombie", {
          id: zombie.id,
          targetPlayerId: "",
        });
        return;
      }
      const distance = Math.hypot(
        targetPlayer.x - collider.current.position.x,
        targetPlayer.y - collider.current.position.y
      );
      if (distance > 200) {
        room?.send("updateZombie", {
          id: zombie.id,
          targetPlayerId: "",
        });
      }
    }
  });

  useTick(() => {
    // zombie logic
    if (zombie.targetPlayerId) {
      // look and move towards the player
      const targetPlayer = players?.get(zombie.targetPlayerId);
      if (!targetPlayer) {
        console.warn("target player not found");
        return;
      }

      // set rotation
      const rotation = Math.atan2(
        targetPlayer.y - collider.current.position.y,
        targetPlayer.x - collider.current.position.x
      );
      setRotation(rotation);

      // move towards the player

      Matter.Body.setVelocity(collider.current, {
        x: Math.cos(rotation) * 1.4,
        y: Math.sin(rotation) * 1.4,
      });
    } else {
      // move randomly
      Matter.Body.setVelocity(collider.current, {
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
      });
    }

    // updating
    setX(collider.current.position.x);
    setY(collider.current.position.y);
  });

  return <ZombieSprite x={x} y={y} rotation={rotation} />;
}
