import { useCallback, useState } from "react";
import { useColyseusRoom } from "../../colyseus";
import { useIsKeyDown } from "../../lib/useControls";
import {
  useNetworkTick,
  useRoomMessageHandler,
  useSelf,
} from "../../lib/networking/hooks";
import { playGunSound } from "../../lib/sound/sound";

export function GunManager({
  x,
  y,
  rotation,
}: {
  x: number;
  y: number;
  rotation: number;
}) {
  const room = useColyseusRoom();
  const isShooting = useIsKeyDown("mouse0");
  const [coolDownUntil, setCoolDownUntil] = useState(0);
  const self = useSelf();

  const shootBullet = useCallback(
    (
      originX: number,
      originY: number,
      rotation: number,
      speed: number,
      damage: number,
      pierces = 1
    ) => {
      room?.send("shoot", {
        originX,
        originY,
        rotation,
        speed,
        damage,
        pierces,
      });
    },
    [room]
  );

  useRoomMessageHandler("shotSound", (message) => {
    console.log("shotSound", message);
    const { playerClass, playerId } = message;
    if (playerId === self.sessionId) {
      playGunSound(playerClass);
    }
  });

  const shoot = useCallback(() => {
    const barrelMoveForwardFactor = self.playerClass === "pistol" ? 70 : 100;
    const originX = x + Math.cos(rotation) * barrelMoveForwardFactor;
    const originY = y + Math.sin(rotation) * barrelMoveForwardFactor;

    const damage = {
      pistol: 40,
      shotgun: 5,
      rifle: 10,
      melee: 0, // no bullets
    }[self.playerClass];

    room?.send("shotSound", {
      playerClass: self.playerClass,
      playerId: self.sessionId,
    });
    playGunSound(self.playerClass);

    if (self.playerClass === "shotgun") {
      for (let i = 0; i < 5; i++) {
        const randomRotation = rotation + (Math.random() - 0.5) * 0.5;
        shootBullet(originX, originY, randomRotation, 20, damage);
      }
    } else {
      const pierces = self.playerClass === "pistol" ? 2 : 1;
      shootBullet(originX, originY, rotation, 20, damage, pierces);
    }
  }, [x, y, rotation, shootBullet, self.playerClass, room, self.sessionId]);

  useNetworkTick((currentTick) => {
    if (isShooting && currentTick > coolDownUntil) {
      shoot();
      const coolDown = {
        pistol: 10,
        shotgun: 30,
        rifle: 3,
        melee: 10,
      }[self.playerClass];

      setCoolDownUntil(currentTick + coolDown);
    }
  });

  return null;
}
