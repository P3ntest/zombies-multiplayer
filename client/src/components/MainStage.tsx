import { Container, Stage } from "@pixi/react";
import { useWindowSize } from "usehooks-ts";
import { Players } from "./Players";
import { Level } from "./Level";
import { useRef } from "react";
import { StageProvider } from "./stageContext";
import "@pixi/events";
import "@pixi/gif";
import { PhysicsProvider } from "../lib/physics/PhysicsProvider";
import { Bullets } from "./bullets/Bullets";
import { Zombies } from "./zombies/Zombies";
import { useBroadcastRoomMessages } from "../lib/networking/hooks";

export const MainStage = () => {
  const windowSize = useWindowSize();
  const mainContentRef = useRef(null);
  useBroadcastRoomMessages();
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
          scale={0.8}
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
            <Bullets />
            <Zombies />
            <Players />
          </StageProvider>
        </Container>
      </PhysicsProvider>
    </Stage>
  );
};
