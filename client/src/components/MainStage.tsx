import { Container, Stage } from "@pixi/react";
import { useWindowSize } from "usehooks-ts";
import { Players } from "./Players";
import { Level } from "./Level";
import { useRef } from "react";
import { StageProvider } from "./stageContext";
import "@pixi/events";
import { PhysicsProvider } from "../lib/physics/PhysicsProvider";

export const MainStage = () => {
  const windowSize = useWindowSize();
  const mainContentRef = useRef(null);
  return (
    <Stage
      options={{
        background: "transparent",
      }}
      width={windowSize.width && windowSize.width > 0 ? windowSize.width : 800}
      height={
        windowSize.height && windowSize.height > 0 ? windowSize.height : 600
      }
    >
      <PhysicsProvider>
        <Container
          ref={mainContentRef}
          mousemove={(e) => {
            console.log(e);
          }}
        >
          <StageProvider
            value={{
              levelContainer: mainContentRef.current,
            }}
          >
            <Level />
            <Players />
          </StageProvider>
        </Container>
      </PhysicsProvider>
    </Stage>
  );
};
