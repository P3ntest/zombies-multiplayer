import { useApp } from "@pixi/react";
import { Players } from "./player/Players";
import { useEffect, useMemo } from "react";
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
import { useCurrentRemoveLevel } from "./level/useRemoteLevel";
import { LevelProvider } from "./level/levelContext";

/**
 * This renders the actual ingame content. It requires to be connected to a game room.
 * It will render the game world and all entities in it, as well as handle UI and Controls
 */
export const MainStage = () => {
  useBroadcastRoomMessages();
  useSetQueryOrReconnectToken();
  const level = useCurrentRemoveLevel();

  if (!level) {
    return <div>Loading Level</div>;
  }

  return (
    <>
      <LevelProvider
        value={{
          level: level,
        }}
      >
        <GameUI />
      </LevelProvider>
      <FullScreenStage>
        <LevelProvider value={{ level }}>
          <Resizer />
          <PhysicsProvider>
            <GameCamera>
              <ZombieSpawner />
              <PlayerSpawner />

              <LevelInstanceRenderer level={level} />

              <Coins />
              <BloodManager />
              <Zombies />
              <Bullets />
              <Players />
            </GameCamera>
          </PhysicsProvider>
        </LevelProvider>
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
