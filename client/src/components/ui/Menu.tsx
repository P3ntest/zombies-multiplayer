import { CharacterPreview } from "./CharacterPreview";
import { PlayerClass } from "../../../../server/src/game/player";
import { Container, Stage } from "@pixi/react";
import { PlayerSprite } from "../player/PlayerSprite";
import { twMerge } from "tailwind-merge";
import { useCharacterCustomizationStore } from "./characterCusotmizationStore";
import { colyseusClient, setCurrentRoom } from "../../colyseus";
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";
import { JoinMenu } from "./JoinMenu";
import { AuthSection } from "./mainMenu/AuthSection";

export function Menu() {
  return (
    <div
      className="h-screen flex flex-row items-center justify-center gap-4 pt-10"
      style={{
        backgroundImage: "url('/assets/apocalypseWallpaper.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="grid grid-cols-3 p-10 gap-10">
        <div className="col-span-2">
          <JoinMenu />
        </div>
        <ClassSelector />
      </div>
    </div>
  );
}

const AVAILABLE_CLASSES: PlayerClass[] = ["pistol", "shotgun", "rifle"];

function ClassSelector() {
  const { selectedClass, setSelectedClass, name, setName } =
    useCharacterCustomizationStore();

  return (
    <div className="flex flex-col items-center gap-4 p-10 card bg-neutral bg-opacity-80">
      <h3 className="text-white font-bold text-2xl">Choose your survivor</h3>

      <CharacterPreview name={name} selectedClass={selectedClass} />
      <div className="flex flex-row gap-3">
        {AVAILABLE_CLASSES.map((playerClass) => {
          return (
            <button
              className={twMerge(
                "btn uppercase",
                selectedClass !== playerClass && "",
                selectedClass === playerClass && "btn-primary"
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
        className="input uppercase"
      />
      <AuthSection />
    </div>
  );
}
