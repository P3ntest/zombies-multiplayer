import { Body } from "matter-js";
import { useBulletHitListener } from "../bullets/bullet";
import { useColyseusRoom } from "../../colyseus";
import { useEffect } from "react";
import { playZombieGrowl } from "../../lib/sound/sound";

export function useZombieBulletHitListener(body: Body, zombieId: string) {
  const room = useColyseusRoom();
  useBulletHitListener(body, (bullet) => {
    room?.send("zombieHit", { zombieId, bulletId: bullet.id });
  });
}

const nextGrowl = () => Math.random() * 5000 + 2000;
export function useGrowling() {
  useEffect(() => {
    const callback = () => {
      playZombieGrowl();
      timeout = setTimeout(callback, nextGrowl());
    };
    let timeout = setTimeout(callback, 100);
    return () => {
      clearTimeout(timeout);
    };
  }, []);
}
