import { Text, useApp, useTick } from "@pixi/react";
import { useRef, useState } from "react";

export function FpsTracker() {
  const app = useApp();
  const [fps, setFps] = useState(0);

  const rollingAverage = useRef<number[]>([]);

  useTick(() => {
    rollingAverage.current.push(app.ticker.FPS);
    if (rollingAverage.current.length > 200) {
      rollingAverage.current.shift();
    }

    setFps(
      rollingAverage.current.reduce((acc, val) => acc + val, 0) /
        rollingAverage.current.length
    );
  });

  return <Text text={`FPS: ${fps.toFixed(0)}`} x={0} y={0} />;
}
