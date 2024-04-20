import Matter, { Render } from "matter-js";
import { useRef, useEffect } from "react";
import { PhysicsContextProvider, physicsContext } from "./context";

export function PhysicsProvider({ children }: { children: React.ReactNode }) {
  const engine = useRef(
    Matter.Engine.create({
      gravity: {
        x: 0,
        y: 0,
      },
    })
  );
  const runner = useRef(Matter.Runner.create());

  useEffect(() => {
    const currentRunner = runner.current;
    Matter.Runner.run(currentRunner, engine.current);
    return () => {
      Matter.Runner.stop(currentRunner);
    };
  }, []);

  return (
    <PhysicsContextProvider
      value={{
        engine: engine.current,
      }}
    >
      {children}
    </PhysicsContextProvider>
  );
}
