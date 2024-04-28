import { Stage } from "@pixi/react";
import { useMemo } from "react";
import { useWindowSize } from "usehooks-ts";
import { TrpcWrapper } from "../../lib/trpc/TrpcWrapper";
import { logtoConfig } from "../../lib/auth/logto";
import { LogtoProvider } from "@logto/react";

export function FullScreenStage({ children }: { children: React.ReactNode }) {
  const windowSize = useWindowSize();

  const options = useMemo(() => {
    return {
      background: "transparent",
      resolution: window.devicePixelRatio,
      eventMode: "static",
    } as const;
  }, []);

  const style = useMemo(() => {
    return {
      width: "100vw",
      height: "100vh",
    };
  }, []);

  return (
    <Stage
      options={options}
      raf
      style={style}
      width={windowSize.width && windowSize.width > 0 ? windowSize.width : 800}
      height={
        windowSize.height && windowSize.height > 0 ? windowSize.height : 600
      }
    >
      <LogtoProvider config={logtoConfig}>
        <TrpcWrapper>{children}</TrpcWrapper>
      </LogtoProvider>
    </Stage>
  );
}
