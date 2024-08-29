/* eslint-disable @typescript-eslint/no-explicit-any */
import { useApp } from "@pixi/react";
import { Players } from "./player/Players";
import { useEffect } from "react";
import "@pixi/events";
import {
  useBroadcastRoomMessages,
  useSetQueryOrReconnectToken,
} from "../lib/networking/hooks";
import { GameUI } from "./ui/GameUI";
import { GameCamera } from "./graphics/Camera";
import { FullScreenStage } from "./graphics/FullScreenStage";
import { useControlEventListeners } from "../lib/useControls";
import { TempFloor } from "./level/LevelInstanceRenderer";
import { Bullets } from "./bullets/Bullets";
import { PhysicsProvider } from "../lib/physics/PhysicsProvider";
import { Vehicles } from "./vehicles/Vehicles";
/**
 * This renders the actual in game content. It requires to be connected to a game room.
 * It will render the game world and all entities in it, as well as handle UI and Controls
 */
export const MainStage = () => {
  // useBroadcastRoomMessages();
  useControlEventListeners();
  useSetQueryOrReconnectToken();

  return (
    <>
      <GameUI />
      <FullScreenStage>
        <Resizer />
        <PhysicsProvider>
          <GameCamera>
            {/* <Zombies /> */}
            <TempFloor />
            <Bullets />
            <Vehicles />
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
