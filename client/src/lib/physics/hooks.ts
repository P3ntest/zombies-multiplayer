import { useContext, useEffect, useRef, useState } from "react";
import { physicsContext } from "./context";
import Matter, { Composite } from "matter-js";

export function usePhysicsWorld() {
  const context = useContext(physicsContext);
  if (!context) {
    throw new Error("usePhysicsWorld must be used within a PhysicsProvider");
  }
  return context.engine.world;
}

export function usePhysicsEngine() {
  const context = useContext(physicsContext);
  if (!context) {
    throw new Error("usePhysicsEngine must be used within a PhysicsProvider");
  }
  return context.engine;
}

type BodyMeta = {
  tags?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export const bodyMeta = new Map<Matter.Body, BodyMeta>();

export function getBodiesWithTag(tag: string) {
  const result: Matter.Body[] = [];
  for (const [body, meta] of bodyMeta) {
    if (meta.tags?.includes(tag)) {
      result.push(body);
    }
  }
  return result;
}

export function getMetaForBody(body: Matter.Body) {
  return bodyMeta.get(body);
}

export function getBodyMeta(body: Matter.Body) {
  return bodyMeta.get(body);
}

export function useBodyRef(factory: () => Matter.Body, meta?: BodyMeta) {
  const world = usePhysicsWorld();
  const body = useRef<Matter.Body>(null!);
  if (!body.current) {
    body.current = factory();
  }

  useEffect(() => {
    if (!world) return;

    const current = body.current!;
    Composite.add(world, current);
    return () => {
      Composite.remove(world, current);
    };
  }, [world, body]);

  useEffect(() => {
    if (meta) {
      bodyMeta.set(body.current, meta);
    }
    return () => {
      bodyMeta.delete(body.current);
    };
  }, [meta, body]);

  return body!;
}

export function useOnCollisionStart(
  callback: (pairs: Matter.IEventCollision<Matter.Engine>["pairs"][0]) => void
) {
  const engine = usePhysicsEngine();
  useEffect(() => {
    const handler = (event: Matter.IEvent<Matter.Engine>) => {
      const collisionEvent = event as Matter.IEventCollision<Matter.Engine>;
      if (!collisionEvent.pairs) return;
      for (const pair of collisionEvent.pairs) {
        callback(pair);
      }
    };
    Matter.Events.on(engine, "collisionStart", handler);
    return () => {
      Matter.Events.off(engine, "collisionStart", handler);
    };
  }, [engine, callback]);
}

export function useFilteredOnCollisionStart(
  filter: Matter.Body,
  callback: (
    pair: Matter.IEventCollision<Matter.Engine>["pairs"][0] & {
      bodySelf: Matter.Body;
      bodyOther: Matter.Body;
    }
  ) => void
) {
  useOnCollisionStart((pair) => {
    const { bodyA, bodyB } = pair;
    if (bodyA === filter || bodyB === filter) {
      callback({
        ...pair,
        bodySelf: bodyA === filter ? bodyA : bodyB,
        bodyOther: bodyA === filter ? bodyB : bodyA,
      });
    }
  });
}
