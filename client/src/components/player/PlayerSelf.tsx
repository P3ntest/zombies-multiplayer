import { useApp, useTick } from "@pixi/react";
import Matter, { Body } from "matter-js";
import { useContext, useEffect, useRef, useState } from "react";
import { PlayerState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom } from "../../colyseus";
import {
  useNetworkTick,
  useRoomMessageHandler,
} from "../../lib/networking/hooks";
import { useBodyRef } from "../../lib/physics/hooks";
import { playHurtSound } from "../../lib/sound/sound";
import { useCurrentPlayerDirection } from "../../lib/useControls";
import { useCheckCollectCoins } from "../coins/coinLogic";
import { useCameraStore } from "../graphics/cameraStore";
import { cameraContext } from "../stageContext";
import { GunManager } from "./GunManager";
import { PlayerSprite } from "./PlayerSprite";
import { calcUpgrade, playerConfig } from "../../../../server/src/game/config";

export function PlayerSelf({ player }: { player: PlayerState }) {
  const collider = useBodyRef(() => {
    return Matter.Bodies.circle(player.x, player.y, 40);
  });

  const room = useColyseusRoom();

  const [currentAnimation, setCurrentAnimation] = useState(0);
  const lastAnimationSent = useRef(0);

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotation, setRotation] = useState(0);

  const app = useApp();
  const stageRef = useContext(cameraContext);

  const currentDirection = useCurrentPlayerDirection();

  useRoomMessageHandler("playerHurt", (message) => {
    if (message.playerId === player.sessionId) {
      playHurtSound();
    }
  });

  useCheckCollectCoins(x, y);

  useTick(() => {
    const { x: mouseX, y: mouseY } = app.renderer.events.pointer.global;
    const { x: stageX, y: stageY } = stageRef?.camera?.toLocal({
      x: mouseX,
      y: mouseY,
    }) ?? { x: 0, y: 0 };

    // the player always looks at the mouse
    const rotation = Math.atan2(stageY - y, stageX - x);

    Body.setVelocity(collider.current, {
      x: calcUpgrade(
        playerConfig.speedUpgrade,
        player.upgrades.speed * currentDirection.x,
        currentDirection.x * playerConfig.baseSpeed
      ),
      y: calcUpgrade(
        playerConfig.speedUpgrade,
        player.upgrades.speed * currentDirection.y,
        currentDirection.y * playerConfig.baseSpeed
      ),
    });

    setX(collider.current.position.x);
    setY(collider.current.position.y);
    setRotation(rotation);
  });

  useNetworkTick(() => {
    room?.send("move", {
      x: Math.round(collider.current.position.x),
      y: Math.round(collider.current.position.y),
      velocityX: collider.current.velocity.x,
      velocityY: collider.current.velocity.y,
      rotation,
      currentAnimation:
        lastAnimationSent.current === currentAnimation
          ? undefined
          : currentAnimation,
    });
    lastAnimationSent.current = currentAnimation;
  });

  return (
    <>
      <PlayerSprite
        currentAnimation={currentAnimation}
        name={player.name}
        playerClass={player.playerClass}
        x={x}
        y={y}
        rotation={rotation}
        health={player.health}
        maxHealth={calcUpgrade(
          playerConfig.healthUpgrade,
          player.upgrades.health,
          playerConfig.startingHealth
        )}
        velocityX={currentDirection.x}
        velocityY={currentDirection.y}
      />
      <GunManager
        x={x}
        y={y}
        rotation={rotation}
        setCurrentAnimation={setCurrentAnimation}
      />
      <PlayerCamera
        x={x}
        y={y}
        zoom={
          1 /
          calcUpgrade(
            playerConfig.zoomUpgrade,
            player.upgrades.scope,
            playerConfig.baseZoom
          )
        }
      />
    </>
  );
}

function PlayerCamera({ x, y, zoom }: { x: number; y: number; zoom: number }) {
  const { setPosition, setZoom } = useCameraStore();

  useEffect(() => {
    setPosition(x, y);
    setZoom(zoom);
  }, [x, y, setPosition, setZoom, zoom]);

  return null;
}
