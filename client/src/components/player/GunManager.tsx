import { useCallback, useState } from "react";
import { useColyseusRoom } from "../../colyseus";
import { useIsKeyDown } from "../../lib/useControls";
import { useNetworkTick } from "../../lib/networking/hooks";

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

  const shoot = useCallback(() => {
    const factor = 100;
    const originX = x + Math.cos(rotation) * factor;
    const originY = y + Math.sin(rotation) * factor;

    room?.send("shoot", {
      originX,
      originY,
      rotation,
      speed: 15,
    });
  }, [room, x, y, rotation]);

  useNetworkTick((currentTick) => {
    if (isShooting && currentTick > coolDownUntil) {
      shoot();
      setCoolDownUntil(currentTick + 10);
    }
  });

  return null;
}
