/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from "@pixi/react";
import { Players } from "./player/Players";
import { useEffect, useId, useMemo } from "react";
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
import { PlayerSpawner } from "./player/PlayerSpawner";
import { FullScreenStage } from "./graphics/FullScreenStage";
import { LevelInstanceRenderer } from "./level/LevelInstanceRenderer";
import { useCurrentRemoteLevel } from "./level/useRemoteLevel";
import { LevelProvider } from "./level/levelContext";
import { useControlEventListeners } from "../lib/useControls";
import testlevel from "./testlevel.json";
/**
 * This renders the actual ingame content. It requires to be connected to a game room.
 * It will render the game world and all entities in it, as well as handle UI and Controls
 */
export const MainStage = () => {
  useBroadcastRoomMessages();
  useControlEventListeners();
  useSetQueryOrReconnectToken();
  const level = useCurrentRemoteLevel()?.level ?? null;

  return (
    <>
      <GameUI />
      <FullScreenStage>
        <Resizer />
        {/* For some damn reason the camera must be here from the beginning */}
        <GameCamera>
          {level && (
            <LevelProvider value={{ level }}>
              <PhysicsProvider>
                <>
                  <ZombieSpawner />
                  <PlayerSpawner />
                  <LevelInstanceRenderer level={level as any} />
                  <Coins />
                  <BloodManager />
                  <Zombies />
                  <Bullets />
                  <Players />
                </>
              </PhysicsProvider>
            </LevelProvider>
          )}
        </GameCamera>
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
