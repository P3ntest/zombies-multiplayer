import Matter from "matter-js";
import {
  PlayerState,
  ZombieState,
} from "../../../../server/src/rooms/schema/MyRoomState";
import { ZombieSprite } from "./Zombies";
import { useBodyRef } from "../../lib/physics/hooks";
import { useTick } from "@pixi/react";
import { useState } from "react";
import { useColyseusRoom } from "../../colyseus";
import { useNetworkTick } from "../../lib/networking/hooks";
import { useZombieBulletHitListener } from "./zombieHooks";
import { useAlivePlayers } from "../../lib/hooks/usePlayers";
import { zombieInfo } from "../../../../server/src/game/zombies";

export function MyZombie({ zombie }: { zombie: ZombieState }) {
  const [x, setX] = useState(zombie.x);
  const [y, setY] = useState(zombie.y);
  const [rotation, setRotation] = useState(zombie.rotation);

  const room = useColyseusRoom();

  const alivePlayers = useAlivePlayers();

  const zombieType = zombieInfo[zombie.zombieType];

  const collider = useBodyRef(
    () => {
      return Matter.Bodies.circle(zombie.x, zombie.y, 40);
    },
    { tags: ["zombie"] }
  );

  useZombieBulletHitListener(collider.current, zombie.id);

  useNetworkTick((currentTick) => {
    room?.send("updateZombie", {
      id: zombie.id,
      x: collider.current.position.x,
      y: collider.current.position.y,
      rotation,
    });

    const closestPlayer = alivePlayers.reduce(
      (closest, player) => {
        const distance = Math.hypot(
          player.x - collider.current.position.x,
          player.y - collider.current.position.y
        );
        if (distance < closest.distance) {
          return { player, distance };
        }
        return closest;
      },
      { player: undefined as undefined | PlayerState, distance: Infinity }
    );

    if (zombie.targetPlayerId == "") {
      // target the closest player
      // all players are dead
      if (!closestPlayer.player) {
        return;
      }

      room?.send("updateZombie", {
        id: zombie.id,
        targetPlayerId: closestPlayer.player.sessionId,
      });
    } else {
      const targetPlayer = alivePlayers.find(
        (player) => player.sessionId === zombie.targetPlayerId
      );
      // died or disconnected
      if (!targetPlayer) {
        room?.send("updateZombie", {
          id: zombie.id,
          targetPlayerId: "",
        });
        return;
      }
      const distanceToTarget = Math.hypot(
        targetPlayer.x - collider.current.position.x,
        targetPlayer.y - collider.current.position.y
      );

      if (targetPlayer.sessionId !== closestPlayer.player?.sessionId) {
        // target the closest player
        room?.send("updateZombie", {
          id: zombie.id,
          targetPlayerId: closestPlayer.player?.sessionId,
        });
      }

      // if the player is close enough, attack
      if (
        distanceToTarget < 100 &&
        zombie.lastAttackTick + zombie.attackCoolDownTicks < currentTick
      ) {
        // attack the player
        room?.send("zombieAttackPlayer", {
          playerId: targetPlayer.sessionId,
          zombieId: zombie.id,
          damage: zombieType.baseAttackDamage,
        });
      }
    }
  });

  useTick(() => {
    // zombie logic
    if (zombie.targetPlayerId) {
      // look and move towards the player
      const targetPlayer = alivePlayers.find(
        (player) => player.sessionId === zombie.targetPlayerId
      );
      if (!targetPlayer) {
        // target player died or disconnected, wait for the next update
        return;
      }

      // set rotation
      const rotation = Math.atan2(
        targetPlayer.y - collider.current.position.y,
        targetPlayer.x - collider.current.position.x
      );
      setRotation(rotation);

      // move towards the player

      const speed = 1.6 * zombieType.baseSpeed;

      Matter.Body.setVelocity(collider.current, {
        x: Math.cos(rotation) * speed,
        y: Math.sin(rotation) * speed,
      });
    } else {
      // rotate in a circle
      setRotation((r) => r + 0.1);
    }

    // updating
    setX(collider.current.position.x);
    setY(collider.current.position.y);
  });

  return (
    <ZombieSprite
      type={zombie.zombieType}
      maxHealth={zombie.maxHealth}
      x={x}
      y={y}
      rotation={rotation}
      health={zombie.health}
    />
  );
}
