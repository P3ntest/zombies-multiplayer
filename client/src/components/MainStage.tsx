import { Container, Stage, useApp } from "@pixi/react";
import { useWindowSize } from "usehooks-ts";
import { Players } from "./player/Players";
import { Level } from "./Level";
import { useEffect, useRef } from "react";
import { StageProvider } from "./stageContext";
import "@pixi/events";
import "@pixi/gif";
import { PhysicsProvider } from "../lib/physics/PhysicsProvider";
import { Bullets } from "./bullets/Bullets";
import { Zombies } from "./zombies/Zombies";
import { useBroadcastRoomMessages } from "../lib/networking/hooks";
import { ZombieSpawner } from "./zombies/ZombieSpawner";
import { GameUI } from "./ui/GameUI";
import { Coins } from "./coins/Coins";

/**
 * This renders the actual ingame content. It requires to be connected to a game room.
 * It will render the game world and all entities in it, as well as handle UI and Controls
 */
export const MainStage = () => {
  const windowSize = useWindowSize();
  const mainContentRef = useRef(null);
  useBroadcastRoomMessages();

  const maxAxis = Math.max(windowSize.width, windowSize.height);
  const scale = (maxAxis / 1920) * 1.2;

  return (
    <>
      <GameUI />
      <Stage
        options={{
          background: "transparent",
          resolution: window.devicePixelRatio,
        }}
        style={{
          width: "100vw",
          height: "100vh",
        }}
        width={
          windowSize.width && windowSize.width > 0 ? windowSize.width : 800
        }
        height={
          windowSize.height && windowSize.height > 0 ? windowSize.height : 600
        }
      >
        <Resizer />
        <PhysicsProvider>
          <Container
            scale={scale}
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
              <ZombieSpawner>
                <Level />
              </ZombieSpawner>
              <Coins />
              <Zombies />
              <Bullets />
              <Players />
            </StageProvider>
          </Container>
        </PhysicsProvider>
      </Stage>
    </>
  );
};

function Resizer() {
  const app = useApp();
  useEffect(() => {
    const resize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", resize);
    return () => {
      window.removeEventListener("resize", resize);
    };
  }, [app]);
  return null;
}
