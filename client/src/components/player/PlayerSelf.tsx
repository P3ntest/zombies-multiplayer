import { useContext, useEffect, useState } from "react";
import { PlayerState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom } from "../../colyseus";
import { useApp, useTick } from "@pixi/react";
import { stageContext } from "../stageContext";
import { useAxis } from "../../lib/useControls";
import { PlayerSprite } from "./PlayerSprite";
import { useBodyRef } from "../../lib/physics/hooks";
import Matter, { Body } from "matter-js";
import { GunManager } from "./GunManager";
import { useCheckCollectCoins } from "../coins/coinLogic";
import { useWindowSize } from "usehooks-ts";
import { useNetworkTick } from "../../lib/networking/hooks";

export function PlayerSelf({ player }: { player: PlayerState }) {
  const collider = useBodyRef(() => {
    return Matter.Bodies.circle(player.x, player.y, 40);
  });

  const room = useColyseusRoom();

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rotation, setRotation] = useState(0);

  const app = useApp();
  const stageRef = useContext(stageContext);

  const currentDirection = useCurrentPlayerDirection();

  useCheckCollectCoins(x, y);

  useTick(() => {
    const { x: mouseX, y: mouseY } = app.renderer.events.pointer.global;
    const { x: stageX, y: stageY } = stageRef?.levelContainer?.toLocal({
      x: mouseX,
      y: mouseY,
    }) ?? { x: 0, y: 0 };

    // the player always looks at the mouse
    const rotation = Math.atan2(stageY - y, stageX - x);

    Body.setVelocity(collider.current, {
      x: currentDirection.x,
      y: currentDirection.y,
    });

    setX(collider.current.position.x);
    setY(collider.current.position.y);
    setRotation(rotation);
  });

  useNetworkTick(() => {
    room?.send("move", {
      x: collider.current.position.x,
      y: collider.current.position.y,
      velocityX: collider.current.velocity.x,
      velocityY: collider.current.velocity.y,
      rotation,
    });
  });

  return (
    <>
      <PlayerSprite
        name={player.name}
        playerClass={player.playerClass}
        x={x}
        y={y}
        rotation={rotation}
        health={player.health}
        velocityX={currentDirection.x}
        velocityY={currentDirection.y}
      />
      <GunManager x={x} y={y} rotation={rotation} />
      {/* <PlayerControls x={player.x} y={player.y} /> */}
      <PlayerCamera x={x} y={y} />
    </>
  );
}

function PlayerCamera({ x, y }: { x: number; y: number }) {
  const stageRef = useContext(stageContext);
  const app = useApp();
  const screen = useWindowSize();

  useEffect(() => {
    stageRef?.levelContainer?.pivot.set(x, y);
    stageRef?.levelContainer?.position.set(screen.width / 2, screen.height / 2);
  }, [
    x,
    y,
    stageRef,
    app.renderer.width,
    app.renderer.height,
    screen.height,
    screen.width,
  ]);

  return null;
}

export function useCurrentPlayerDirection() {
  const axis = useAxis();
  const speed = 4;

  const speedX = axis.x;
  const speedY = axis.y;

  const mag = Math.sqrt(speedX ** 2 + speedY ** 2);

  if (mag === 0) {
    return { x: 0, y: 0 };
  }

  const normalizedX = (speedX / mag) * speed;
  const normalizedY = (speedY / mag) * speed;

  return {
    x: normalizedX,
    y: normalizedY,
  };
}
