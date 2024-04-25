import { Stage } from "@pixi/react";
import { useWindowSize } from "usehooks-ts";

export function FullScreenStage({ children }: { children: React.ReactNode }) {
  const windowSize = useWindowSize();

  return (
    <Stage
      options={{
        background: "transparent",
        resolution: window.devicePixelRatio,
        eventMode: "static",
      }}
      style={{
        width: "100vw",
        height: "100vh",
      }}
      width={windowSize.width && windowSize.width > 0 ? windowSize.width : 800}
      height={
        windowSize.height && windowSize.height > 0 ? windowSize.height : 600
      }
    >
      {children}
    </Stage>
  );
}
