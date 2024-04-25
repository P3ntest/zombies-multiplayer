import { MutableRefObject, useCallback, useRef, useState } from "react";
import {
  PlayerState,
  ZombieState,
} from "../../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom } from "../../colyseus";
import Matter, { Body } from "matter-js";
import { useAlivePlayers } from "../../lib/hooks/usePlayers";
import {
  useNetworkTick,
  useRoomMessageHandler,
} from "../../lib/networking/hooks";
import { zombieInfo } from "../../../../server/src/game/zombies";
import { useTick } from "@pixi/react";
import { bodyMeta } from "../../lib/physics/hooks";
import { zombieUpdatesBatch } from "../../lib/networking/batches";
import { useCalculateNextPointPathFinding } from "./pathfinding/astar";

export function useZombieLogic(
  zombie: ZombieState,
  collider: MutableRefObject<Matter.Body>
) {
  const [rotation, setRotation] = useState(zombie.rotation);
  const [x, setX] = useState(zombie.x);
  const [y, setY] = useState(zombie.y);
  const zombieType = zombieInfo[zombie.zombieType];
  const [currentTarget, setCurrentTarget] = useState<
    | {
        x: number;
        y: number;
      }
    | "direct"
    | null
  >(null);

  const tickOffset = useState(Math.floor(Math.random() * 50))[0];

  const room = useColyseusRoom();
  const alivePlayers = useAlivePlayers();

  const failedPathFindAttempts = useRef(0);

  const calculateNextPointPathFinding = useCalculateNextPointPathFinding();

  useRoomMessageHandler("zombieHit", (message) => {
    const { zombieId, angle, knockBack } = message;
    if (zombieId !== zombie.id) return;

    const force = 0.3 * knockBack;
    const vector = {
      x: Math.cos(angle) * force,
      y: Math.sin(angle) * force,
    };

    Body.applyForce(collider.current, collider.current.position, vector);
  });

  const updateTarget = useCallback(
    (pathFind: boolean) => {
      const obstacles = getObstacles();

      const visiblePlayers = alivePlayers.filter((player) => {
        const ray = Matter.Query.ray(obstacles, collider.current.position, {
          x: player.x,
          y: player.y,
        });
        return ray.length === 0;
      });

      const currentTargetPlayer = alivePlayers.find(
        (player) => player.sessionId === zombie.targetPlayerId
      );

      const currentTargetVisible = visiblePlayers.some(
        (player) => player.sessionId === zombie.targetPlayerId
      );

      // if the current target does not exist anymore at all, we change to a new one
      if (!currentTargetPlayer) {
        // if there are no visible players, we just pick a random one
        const newTarget =
          visiblePlayers[Math.floor(Math.random() * visiblePlayers.length)] ??
          alivePlayers[Math.floor(Math.random() * alivePlayers.length)];

        if (!newTarget) return;

        zombieUpdatesBatch.add({
          id: zombie.id,
          targetPlayerId: newTarget.sessionId,
        });
        return;
      }

      // if the current is not visible but others are, we change to a new one
      if (!currentTargetVisible && visiblePlayers.length > 0) {
        const newTarget =
          visiblePlayers[Math.floor(Math.random() * visiblePlayers.length)];

        zombieUpdatesBatch.add({
          id: zombie.id,
          targetPlayerId: newTarget.sessionId,
        });
        return;
      }

      if (currentTargetVisible) {
        failedPathFindAttempts.current = 0;
        setCurrentTarget("direct");
      } else {
        if (pathFind) {
          const nextPoint = calculateNextPointPathFinding(
            collider.current.position,
            currentTargetPlayer,
            zombieType.size
          );
          if (!nextPoint) {
            failedPathFindAttempts.current++;
            setCurrentTarget("direct");

            if (failedPathFindAttempts.current > 5) {
              room?.send("zombieDespawn", { zombieId: zombie.id });
              return;
            }
          } else {
            failedPathFindAttempts.current = 0;
            setCurrentTarget(nextPoint);
          }
        }
      }
    },
    [
      alivePlayers,
      collider,
      zombie.id,
      zombie.targetPlayerId,
      zombieType.size,
      room,
    ]
  );

  useNetworkTick((currentTick) => {
    zombieUpdatesBatch.add({
      id: zombie.id,
      x: collider.current.position.x,
      y: collider.current.position.y,
      rotation,
    });

    const offsetTick = currentTick + tickOffset;
    if (offsetTick % 10 === 0) {
      // 2 times per second
      updateTarget(offsetTick % 20 === 0);
    }

    const targetPlayer = alivePlayers.find(
      (player) => player.sessionId === zombie.targetPlayerId
    );
    if (targetPlayer) {
      attackLogic(
        targetPlayer,
        zombie,
        x,
        y,
        room,
        currentTick,
        zombieType.baseAttackDamage
      );
    }
  });

  useTick(() => {
    // look and move towards the player
    const target =
      currentTarget === "direct"
        ? alivePlayers.find(
            (player) => player.sessionId === zombie.targetPlayerId
          )
        : currentTarget;

    if (!target) return;

    // set rotation
    const rotation = Math.atan2(
      target.y - collider.current.position.y,
      target.x - collider.current.position.x
    );
    setRotation(rotation);

    // move towards the player

    const speed = 2.3 * zombieType.baseSpeed;

    const targetVelocity = {
      x: Math.cos(rotation) * speed,
      y: Math.sin(rotation) * speed,
    };

    const delta = {
      x: targetVelocity.x - collider.current.velocity.x,
      y: targetVelocity.y - collider.current.velocity.y,
    };

    if (Number.isNaN(delta.x) || Number.isNaN(delta.y)) {
      return;
    }

    Body.applyForce(collider.current, collider.current.position, {
      x: delta.x * 0.003,
      y: delta.y * 0.003,
    });

    // updating
    setX(collider.current.position.x);
    setY(collider.current.position.y);
  });

  return {
    rotation,
    x,
    y,
  };
}

export function getObstacles() {
  return Array.from(bodyMeta.entries())
    .filter(([, meta]) => meta.tags?.includes("obstacle"))
    .map(([body]) => body);
}

function attackLogic(
  targetPlayer: PlayerState,
  zombie: ZombieState,
  x: number,
  y: number,
  room: ReturnType<typeof useColyseusRoom>,
  currentTick: number,
  damage: number
) {
  const distanceToTarget = Math.hypot(targetPlayer.x - x, targetPlayer.y - y);
  if (
    distanceToTarget < 100 &&
    zombie.lastAttackTick + zombie.attackCoolDownTicks < currentTick
  ) {
    // attack the player
    room?.send("zombieAttackPlayer", {
      playerId: targetPlayer.sessionId,
      zombieId: zombie.id,
      damage,
    });
  }
}
