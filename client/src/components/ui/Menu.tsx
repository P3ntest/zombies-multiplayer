import { useState } from "react";
import { PlayerClass } from "../../../../server/src/game/player";
import { Container, Stage } from "@pixi/react";
import { PlayerSprite } from "../player/PlayerSprite";
import { twMerge } from "tailwind-merge";
import { useCharacterCustomizationStore } from "./characterCusotmizationStore";
import { colyseusClient, setCurrentRoom } from "../../colyseus";
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";

let connecting = false;

export function Menu() {
  const { selectedClass, name } = useCharacterCustomizationStore();
  return (
    <div className="bg-slate-900 min-h-screen">
      <h1>Menu</h1>
      <button
        className="bg-slate-700 text-white p-2 rounded uppercase font-bold hover:bg-slate-500 hover:scale-105 transition-all"
        onClick={() => {
          if (connecting) {
            return;
          }
          connecting = true;
          colyseusClient
            .joinOrCreate<MyRoomState>("my_room", {
              playerClass: selectedClass,
              name,
            })
            .then((room) => {
              setCurrentRoom(room);
            })
            .finally(() => {
              connecting = false;
            });
        }}
      >
        Join
      </button>
      <ClassSelector />
    </div>
  );
}

const AVAILABLE_CLASSES: PlayerClass[] = ["pistol", "shotgun", "rifle"];

const PREVIEW_SIZE = 300;

function ClassSelector() {
  const { selectedClass, setSelectedClass, name, setName } =
    useCharacterCustomizationStore();

  return (
    <div className="flex flex-col items-center gap-4">
      <h3 className="text-white font-bold text-2xl">Character Selector</h3>

      <Stage
        width={PREVIEW_SIZE}
        height={PREVIEW_SIZE}
        options={{
          backgroundAlpha: 0,
        }}
      >
        <Container
          x={PREVIEW_SIZE / 2}
          y={PREVIEW_SIZE / 2}
          scale={PREVIEW_SIZE / 200}
          rotation={0}
        >
          <PlayerSprite
            name={name}
            playerClass={selectedClass}
            x={-20}
            y={0}
            rotation={0}
            velocityX={10}
            velocityY={10}
            health={100}
          />
        </Container>
      </Stage>
      <div className="flex flex-row gap-3">
        {AVAILABLE_CLASSES.map((playerClass) => {
          return (
            <button
              className={twMerge(
                "button",
                selectedClass === playerClass && "button_selected"
              )}
              key={playerClass}
              onClick={() => setSelectedClass(playerClass)}
            >
              {playerClass}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.substring(0, 16))}
        placeholder="Name"
        className="input button"
      />
    </div>
  );
}
