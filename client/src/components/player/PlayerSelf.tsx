import { useApp, useTick } from "@pixi/react";
import { useContext, useEffect } from "react";

import { useColyseusRoom } from "../../colyseus";

import {
  useCurrentPlayerDirection,
  useIsShooting,
} from "../../lib/useControls";
import { useCameraStore } from "../graphics/cameraStore";
import { cameraContext } from "../stageContext";
import { PlayerSprite } from "./PlayerSprite";

import {
  playerCollider,
  PlayerState,
} from "../../../../server/src/rooms/Player";
import { useLerpedVec2 } from "../../lib/useLerped";
import { useBeforePhysicsUpdate, useBodyRef } from "../../lib/physics/hooks";
import { deadZoneLerp } from "../../lib/physics/utils";
import { Body, Vector } from "matter-js";
import { useUpdate } from "../util/useUpdate";

export function PlayerSelf({ player }: { player: PlayerState }) {
  const room = useColyseusRoom();

  // const [currentAnimation, setCurrentAnimation] = useState(
  //   player.currentAnimation
  // );
  // const lastAnimationSent = useRef(player.currentAnimation);

  // const [x, setX] = useState(player.x);
  // const [y, setY] = useState(player.y);

  const app = useApp();
  const stageRef = useContext(cameraContext);

  // const { touch, touchLook } = useControlsStore();

  // useRoomMessageHandler("playerHurt", (message) => {
  //   if (message.playerId === player.sessionId) {
  //     playHurtSound();
  //   }
  // });

  const body = useBodyRef(playerCollider);

  const update = useUpdate();

  const currentDirection = useCurrentPlayerDirection();
  const isShooting = useIsShooting();

  const position = useLerpedVec2(body.current.position, 0.3);

  useTick(() => {
    const { x: mouseX, y: mouseY } = app.renderer.events.pointer.global;
    const { x: stageX, y: stageY } = stageRef!.camera!.toLocal({
      x: mouseX,
      y: mouseY,
    });

    const rotation = Math.atan2(stageY - position.y, stageX - position.x);

    room.send("update", {
      x: currentDirection.x,
      y: currentDirection.y,
      rotation,
      isShooting,
    });

    Body.setAngle(body.current, rotation);
    update();
  });

  useBeforePhysicsUpdate(() => {
    // deadZone lerp to make sure the client keeps the same direction as the server
    Body.setPosition(body.current, {
      x: deadZoneLerp(body.current.position.x, player.transform.x, 10, 0.2),
      y: deadZoneLerp(body.current.position.y, player.transform.y, 10, 0.2),
    });

    if (player.mountedVehicleId) {
      body.current.isSensor = true;
      update();
      return;
    } else {
      body.current.isSensor = false;
    }

    const targetVelocity = Vector.mult(currentDirection, 1.5);
    const delta = Vector.sub(targetVelocity, body.current.velocity);
    const force = Vector.mult(delta, 0.01);
    Body.applyForce(body.current, body.current.position, force);
    update();
  });

  const isInVehicle = player.mountedVehicleId;
  if (isInVehicle) {
    return null;
  }

  return (
    <>
      <PlayerSprite
        currentAnimation={0}
        name={player.name}
        playerClass={"pistol"}
        x={position.x}
        y={position.y}
        rotation={body.current.angle}
        health={player.health}
        maxHealth={100}
        velocityX={body.current.velocity.x}
        velocityY={body.current.velocity.y}
      />
      <PlayerCamera x={position.x} y={position.y} zoom={0.6} />
    </>
  );
}

export function PlayerCamera({
  x,
  y,
  zoom,
}: {
  x: number;
  y: number;
  zoom: number;
}) {
  const { setPosition, setZoom } = useCameraStore();

  useEffect(() => {
    setPosition(x, y);
    setZoom(zoom);
  }, [x, y, setPosition, setZoom, zoom]);

  return null;
}
