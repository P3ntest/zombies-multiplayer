import { useCallback, useRef, useState } from "react";
import { useColyseusRoom } from "../../colyseus";
import { useIsKeyDown } from "../../lib/useControls";
import {
  useNetworkTick,
  useRoomMessageHandler,
  useSelf,
} from "../../lib/networking/hooks";
import { playGunSound } from "../../lib/sound/sound";
import { useTick } from "@pixi/react";

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
  const coolDown = useRef(0);
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
    const { playerClass, playerId } = message;
    if (playerId !== self.sessionId) {
      playGunSound(playerClass);
    }
  });

  const shoot = useCallback(
    (coolDownTicksAfter: number) => {
      const barrelMoveForwardFactor = self.playerClass === "pistol" ? 70 : 100;
      const originX = x + Math.cos(rotation) * barrelMoveForwardFactor;
      const originY = y + Math.sin(rotation) * barrelMoveForwardFactor;

      const damage =
        {
          pistol: 30,
          shotgun: 10,
          rifle: 10,
          melee: 0,
        }[self.playerClass] *
        1.4 ** self.upgrades.damage;

      room?.send("shotSound", {
        playerClass: self.playerClass,
        playerId: self.sessionId,
      });
      playGunSound(self.playerClass, (coolDownTicksAfter / 20) * 1000);

      if (self.playerClass === "shotgun") {
        for (let i = 0; i < 5; i++) {
          const randomRotation = rotation + (Math.random() - 0.5) * 0.5;
          shootBullet(originX, originY, randomRotation, 20, damage);
        }
      } else {
        const pierces = self.playerClass === "pistol" ? 2 : 1;
        shootBullet(originX, originY, rotation, 20, damage, pierces);
      }
    },
    [
      x,
      y,
      rotation,
      shootBullet,
      self.playerClass,
      room,
      self.sessionId,
      self.upgrades.damage,
    ]
  );

  useTick((delta) => {
    coolDown.current -= delta * (1000 / 60);
    sd;
    if (isShooting && coolDown.current <= 0) {
      const coolDownTicks =
        {
          pistol: 20,
          shotgun: 30,
          rifle: 5,
          melee: 10,
        }[self.playerClass] *
        0.8 ** self.upgrades.fireRate;
      shoot(coolDownTicks);

      coolDown.current = (coolDownTicks / 20) * 1000;
    }
  });

  return null;
}
