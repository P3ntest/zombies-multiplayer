import { Bodies, Body } from "matter-js";
import { TransformState } from "../../../../server/src/rooms/World";
import { useBeforePhysicsUpdate } from "./hooks";
import { MutableRefObject, useCallback } from "react";

export function deadZoneLerp(
  value: number,
  target: number,
  deadZone: number,
  lerp: number
) {
  if (lerp === 1) return target;

  if (Math.abs(value - target) < deadZone) return value;

  return value + (target - value) * lerp;
}

export function syncSchemaToBody(schema: TransformState, body: Body) {
  Body.setPosition(body, {
    x: schema.x,
    y: schema.y,
  });

  Body.setVelocity(body, {
    x: schema.velocityX,
    y: schema.velocityY,
  });

  Body.setAngle(body, schema.rotation);
  Body.setAngularVelocity(body, schema.angularVelocity);
}

export function useSyncSchemaToBody(
  schema: TransformState,
  body: MutableRefObject<Body>
) {
  useBeforePhysicsUpdate(
    useCallback(() => {
      syncSchemaToBody(schema, body.current);
    }, [body, schema])
  );
}
