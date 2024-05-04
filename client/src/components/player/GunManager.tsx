import { useCallback, useRef } from "react";
import { useColyseusRoom } from "../../colyseus";
import { useIsKeyDown, useIsShooting } from "../../lib/useControls";
import { useRoomMessageHandler, useSelf } from "../../lib/networking/hooks";
import { playGunSound, playMeleeSound } from "../../lib/sound/sound";
import { useTick } from "@pixi/react";
import {
  PlayerAnimations,
  getWeaponData,
} from "../../../../server/src/game/player";
import { bodyMeta, getBodiesWithTag } from "../../lib/physics/hooks";
import Matter from "matter-js";
import {
  callWaveBasedFunction,
  weaponConfig,
} from "../../../../server/src/game/config";

export function GunManager({
  x,
  y,
  rotation,
  setCurrentAnimation,
}: {
  x: number;
  y: number;
  rotation: number;
  setCurrentAnimation: (animation: number) => void;
}) {
  const room = useColyseusRoom();
  const isShooting = useIsShooting();
  const isAttackingMelee = useIsKeyDown("f");
  const shootCoolDown = useRef(0);
  const meleeCoolDown = useRef({
    animationEndsIn: 0,
    hasAttacked: false,
    attacksIn: 0,
    meleeCoolDown: 0,
  });
  const self = useSelf();

  const shootBullet = useCallback(
    (
      originX: number,
      originY: number,
      rotation: number,
      speed: number,
      damage: number,
      pierces = 1,
      knockBack = 1
    ) => {
      room?.send("shoot", {
        originX,
        originY,
        rotation,
        speed,
        damage,
        pierces,
        knockBack,
      });
    },
    [room]
  );

  const melee = useCallback(() => {
    const zombies = getBodiesWithTag("zombieHitBox");

    const MELEE_RANGE = 140;
    const collisions = Matter.Query.ray(
      zombies,
      { x, y },
      {
        x: x + Math.cos(rotation) * MELEE_RANGE,
        y: y + Math.sin(rotation) * MELEE_RANGE,
      },
      100
    );
    playMeleeSound(collisions.length > 0);
    collisions.forEach(
      (collisions) => {
        const zombieBody = zombies.includes(collisions.bodyA)
          ? collisions.bodyA
          : collisions.bodyB;
        const zombieMeta = bodyMeta.get(zombieBody);
        const zombieId = zombieMeta?.id;
        if (zombieId) {
          room?.send("meleeHitZombie", {
            zombieId,
            damage: callWaveBasedFunction(
              weaponConfig.damageUpgrade,
              self.upgrades.damage,
              weaponConfig.weapons.melee.damage
            ),
            knockBack: weaponConfig.weapons.melee.knockBack,
          });
        }
      },
      [x, y, rotation]
    );
  }, [x, y, rotation, self.upgrades.damage, room]);

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

      const weapon = getWeaponData(self.playerClass);
      const damage = callWaveBasedFunction(
        weaponConfig.damageUpgrade,
        self.upgrades.damage,
        weapon.damage
      );
      const pierces = callWaveBasedFunction(
        weaponConfig.pierceUpgrade,
        self.upgrades.pierce,
        weapon.pierce
      );
      const bulletSpread = weapon.bulletSpread;

      room?.send("shotSound", {
        playerClass: self.playerClass,
        playerId: self.sessionId,
      });
      playGunSound(self.playerClass, (coolDownTicksAfter / 20) * 1000);

      if (self.playerClass === "shotgun") {
        const SPREAD_RANGE = 0.45;
        const bulletAmount = weaponConfig.weapons.shotgun.bulletAmount;
        for (let i = 0; i < bulletAmount; i++) {
          //evenly spread bullets
          const evenRotation =
            rotation -
            SPREAD_RANGE / 2 +
            (SPREAD_RANGE / (bulletAmount - 1)) * i;
          const randomRotation =
            evenRotation + Math.random() * bulletSpread - bulletSpread / 2;

          shootBullet(
            originX,
            originY,
            randomRotation,
            weapon.bulletSpeed,
            damage,
            pierces,
            weapon.knockBack
          );
        }
      } else {
        const randomRotation =
          rotation + Math.random() * bulletSpread - bulletSpread / 2;
        shootBullet(
          originX,
          originY,
          randomRotation,
          weapon.bulletSpeed,
          damage,
          pierces,
          weapon.knockBack
        );
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
      self.upgrades.pierce,
    ]
  );

  useTick((delta) => {
    const time = delta * (1000 / 60);
    shootCoolDown.current -= time;
    meleeCoolDown.current.animationEndsIn -= time;
    meleeCoolDown.current.attacksIn -= time;
    meleeCoolDown.current.meleeCoolDown -= time;

    if (meleeCoolDown.current.animationEndsIn > 0) {
      if (
        !meleeCoolDown.current.hasAttacked &&
        meleeCoolDown.current.attacksIn <= 0
      ) {
        meleeCoolDown.current.hasAttacked = true;
        melee();
      }
      return;
    } else {
      setCurrentAnimation(PlayerAnimations.NONE);
    }
    if (isAttackingMelee && meleeCoolDown.current.meleeCoolDown <= 0) {
      meleeCoolDown.current = {
        animationEndsIn: 390,
        hasAttacked: false,
        attacksIn: 200,
        meleeCoolDown: 1000,
      };
      setCurrentAnimation(PlayerAnimations.MELEE);
      return;
    }
    if (isShooting && shootCoolDown.current <= 0) {
      const coolDownTicks =
        200 /
        callWaveBasedFunction(
          weaponConfig.fireRateUpgrade,
          self.upgrades.fireRate,
          getWeaponData(self.playerClass).fireRate
        );
      shoot(coolDownTicks);

      shootCoolDown.current = (coolDownTicks / 20) * 1000;
    }
  });

  return null;
}
