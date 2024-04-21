import { Body } from "matter-js";
import { BulletState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useEffect, useRef } from "react";

type BulletHitCallback = (bullet: BulletState) => void;

export const bulletHitListeners = new Map<Body, Set<BulletHitCallback>>();

export function useBulletHitListener(body: Body, callback: BulletHitCallback) {
  const currentCallback = useRef(callback);
  currentCallback.current = callback;

  useEffect(() => {
    const existingListeners = bulletHitListeners.get(body) ?? new Set();
    existingListeners.add(callback);
    bulletHitListeners.set(body, existingListeners);

    return () => {
      const existingListeners = bulletHitListeners.get(body) ?? new Set();
      existingListeners.delete(callback);
      bulletHitListeners.set(body, existingListeners);
    };
  }, [body, callback]);
}
