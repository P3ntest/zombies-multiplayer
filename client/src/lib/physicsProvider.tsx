import * as Matter from "matter-js";
import { createContext, useEffect, useRef } from "react";

interface PhysicsContextState {
  engine: Matter.Engine;
}

const PhysicsContext = createContext<PhysicsContextState | null>(null);

export function PhysicsProvider({ children }: { children: React.ReactNode }) {
  const engine = useRef(Matter.Engine.create());
  const runner = useRef(Matter.Runner.create());

  useEffect(() => {
    const currentRunner = runner.current;
    Matter.Runner.run(currentRunner, engine.current);
    return () => {
      Matter.Runner.stop(currentRunner);
    };
  }, []);

  return (
    <PhysicsContext.Provider
      value={{
        engine: engine.current,
      }}
    >
      {children}
    </PhysicsContext.Provider>
  );
}
