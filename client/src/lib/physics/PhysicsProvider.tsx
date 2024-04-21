import Matter, { Engine, Render } from "matter-js";
import { useRef, useEffect } from "react";
import { PhysicsContextProvider, physicsContext } from "./context";
import { PhysicsTicker } from "./ticker";

export function PhysicsProvider({ children }: { children: React.ReactNode }) {
  const engine = useRef(
    Matter.Engine.create({
      gravity: {
        x: 0,
        y: 0,
      },
    })
  );

  const ticker = useRef(
    new PhysicsTicker((delta: number) => {
      Matter.Engine.update(engine.current, delta);
    })
  );

  useEffect(() => {
    const currentTicker = ticker.current;
    currentTicker.start();
    return () => {
      currentTicker.stop();
    };
  }, []);

  return (
    <PhysicsContextProvider
      value={{
        engine: engine.current,
        ticker: ticker.current,
      }}
    >
      {children}
    </PhysicsContextProvider>
  );
}
