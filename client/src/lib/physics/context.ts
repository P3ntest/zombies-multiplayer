import type Matter from "matter-js";
import { createContext } from "react";
import { PhysicsTicker } from "./ticker";

interface PhysicsContextState {
  engine: Matter.Engine;
  ticker: PhysicsTicker;
}

export const physicsContext = createContext<PhysicsContextState | null>(null);
export const PhysicsContextProvider = physicsContext.Provider;
