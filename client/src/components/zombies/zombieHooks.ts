import { Body } from "matter-js";
import { useBulletHitListener } from "../bullets/bullet";
import { useColyseusRoom } from "../../colyseus";

export function useZombieBulletHitListener(body: Body, zombieId: string) {
  const room = useColyseusRoom();
  useBulletHitListener(body, (bullet) => {
    room?.send("zombieHit", { zombieId, bulletId: bullet.id });
  });
}
