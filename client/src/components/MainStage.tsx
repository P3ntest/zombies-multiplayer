import { Container, Stage, useApp } from "@pixi/react";
import { useWindowSize } from "usehooks-ts";
import { Players } from "./player/Players";
import { Level } from "./Level";
import { useEffect, useRef } from "react";
import { CameraProvider } from "./stageContext";
import "@pixi/events";
import { PhysicsProvider } from "../lib/physics/PhysicsProvider";
import { Bullets } from "./bullets/Bullets";
import { Zombies } from "./zombies/Zombies";
import {
  useBroadcastRoomMessages,
  useSetQueryOrReconnectToken,
} from "../lib/networking/hooks";
import { ZombieSpawner } from "./zombies/ZombieSpawner";
import { GameUI } from "./ui/GameUI";
import { Coins } from "./coins/Coins";
import { BloodManager } from "./effects/Blood";
import { GameCamera } from "./graphics/Camera";
import { SpawnPointManager } from "./level/SpawnPoint";
import { PlayerSpawner } from "./player/PlayerSpawner";
import { FullScreenStage } from "./graphics/FullScreenStage";

/**
 * This renders the actual ingame content. It requires to be connected to a game room.
 * It will render the game world and all entities in it, as well as handle UI and Controls
 */
export const MainStage = () => {
  useBroadcastRoomMessages();
  useSetQueryOrReconnectToken();

  return (
    <>
      <GameUI />
      <FullScreenStage>
        <Resizer />
        <PhysicsProvider>
          <GameCamera>
            <SpawnPointManager>
              <ZombieSpawner />
              <PlayerSpawner />
              <Level />
            </SpawnPointManager>
            <Coins />
            <BloodManager />
            <Zombies />
            <Bullets />
            <Players />
          </GameCamera>
        </PhysicsProvider>
      </FullScreenStage>
    </>
  );
};

export function Resizer() {
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
