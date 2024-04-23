import { useApp, useTick } from "@pixi/react";
import Matter, { Body } from "matter-js";
import { useContext, useEffect, useState } from "react";
import { useWindowSize } from "usehooks-ts";
import { PlayerState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom } from "../../colyseus";
import { useNetworkTick } from "../../lib/networking/hooks";
import { useBodyRef } from "../../lib/physics/hooks";
import { useCurrentPlayerDirection } from "../../lib/useControls";
import { useCheckCollectCoins } from "../coins/coinLogic";
import { stageContext } from "../stageContext";
import { GunManager } from "./GunManager";
import { PlayerSprite } from "./PlayerSprite";

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
      x: currentDirection.x + player.upgrades.speed * currentDirection.x * 0.4,
      y: currentDirection.y + player.upgrades.speed * currentDirection.y * 0.4,
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
        maxHealth={100 + 20 * player.upgrades.health}
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
