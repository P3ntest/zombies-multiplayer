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
import {
  useControlsStore,
  useCurrentPlayerDirection,
} from "../../lib/useControls";
import { useCameraStore } from "../graphics/cameraStore";
import { cameraContext } from "../stageContext";
import { GunManager } from "./GunManager";
import { PlayerSprite } from "./PlayerSprite";
import {
  callWaveBasedFunction,
  playerConfig,
} from "../../../../server/src/game/config";
import { getMaxHealth } from "../../../../server/src/game/player";

export function PlayerSelf({ player }: { player: PlayerState }) {
  const collider = useBodyRef(() => {
    return Matter.Bodies.circle(player.x, player.y, 40);
  });

  const room = useColyseusRoom();

  const [currentAnimation, setCurrentAnimation] = useState(
    player.currentAnimation
  );
  const lastAnimationSent = useRef(player.currentAnimation);

  const [x, setX] = useState(player.x);
  const [y, setY] = useState(player.y);
  const [rotation, setRotation] = useState(player.rotation);

  const app = useApp();
  const stageRef = useContext(cameraContext);

  const currentDirection = useCurrentPlayerDirection();

  const { touch, touchLook } = useControlsStore();

  useRoomMessageHandler("playerHurt", (message) => {
    if (message.playerId === player.sessionId) {
      playHurtSound();
    }
  });

  useTick(() => {
    let rotation;

    if (touch) {
      const { x: touchX, y: touchY } = touchLook;
      rotation = Math.atan2(touchY, touchX);
    } else {
      const { x: mouseX, y: mouseY } = app.renderer.events.pointer.global;
      const { x: stageX, y: stageY } = stageRef?.camera?.toLocal({
        x: mouseX,
        y: mouseY,
      }) ?? { x: 0, y: 0 };
      rotation = Math.atan2(stageY - y, stageX - x);
    }

    Body.setVelocity(collider.current, {
      x: callWaveBasedFunction(
        playerConfig.speedUpgrade,
        player.upgrades.speed * currentDirection.x,
        currentDirection.x * playerConfig.baseSpeed
      ),
      y: callWaveBasedFunction(
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
        maxHealth={getMaxHealth(player)}
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
          callWaveBasedFunction(
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
