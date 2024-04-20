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

export function useBodyRef(factory: () => Matter.Body) {
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
      console.log("Removing body from world");
      Composite.remove(world, current);
    };
  }, [world, body]);

  return body!;
}
