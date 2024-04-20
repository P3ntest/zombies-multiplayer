import type Matter from "matter-js";
import { createContext } from "react";

interface PhysicsContextState {
  engine: Matter.Engine;
}

export const physicsContext = createContext<PhysicsContextState | null>(null);
export const PhysicsContextProvider = physicsContext.Provider;
