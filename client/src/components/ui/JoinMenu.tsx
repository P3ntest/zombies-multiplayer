import { useCallback, useState } from "react";
import { colyseusClient, setCurrentRoom } from "../../colyseus";
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useCharacterCustomizationStore } from "./characterCusotmizationStore";
import { useNavigate } from "react-router-dom";
import { MapSelector } from "./mainMenu/MapSelector";
import { twMerge } from "tailwind-merge";

let connecting = false;

export function JoinMenu() {
  const { selectedClass, name } = useCharacterCustomizationStore();
  const navigate = useNavigate();
  const [selectedRoom, setSelectedRoom] = useState<
    "singlePlayer" | "multiPlayer"
  >("multiPlayer");
  const [step, setStep] = useState<"main" | "roomSettings">("main");

  const pressQuickPlay = useCallback(() => {
    if (connecting) return;
    connecting = true;
    colyseusClient
      .joinOrCreate<MyRoomState>("my_room", {
        quickPlay: true,

        playerName: name,
        playerClass: selectedClass,
      })
      .then(setCurrentRoom)
      .finally(() => {
        connecting = false;
      });
  }, [name, selectedClass]);

  if (step === "roomSettings") {
    return (
      <div className="card bg-neutral h-full p-10">
        <RoomSettings
          roomType={selectedRoom}
          onBack={() => {
            setStep("main");
          }}
        />
      </div>
    );
  }

  return (
    <div className="card bg-neutral h-full p-10 bg-opacity-80">
      <div className="w-full flex flex-col items-center gap-10">
        <h3 className="text-white font-bold text-2xl">Join a game</h3>
        <div className="flex flex-col gap-4 w-80">
          <button
            className="btn btn-primary"
            disabled={connecting}
            onClick={pressQuickPlay}
          >
            QuickPlay
          </button>
          <button
            className="btn "
            disabled={connecting}
            onClick={() => {
              setStep("roomSettings");
              setSelectedRoom("singlePlayer");
            }}
          >
            Single Player
          </button>
          <button
            className="btn"
            disabled={connecting}
            onClick={() => {
              setStep("roomSettings");
              setSelectedRoom("multiPlayer");
            }}
          >
            Create Room
          </button>
          <JoinByIdField />
        </div>
        <button
          className="btn"
          onClick={() => {
            navigate("/editor");
          }}
        >
          Map Editor
        </button>
      </div>
    </div>
  );
}

function JoinByIdField() {
  const [error, setError] = useState<string | null>(null);
  const { selectedClass, name } = useCharacterCustomizationStore();

  const [id, setId] = useState("");

  const pressJoin = useCallback(() => {
    if (connecting) return;
    connecting = true;
    if (!id) {
      setError("ID is required");
      connecting = false;
      return;
    }
    colyseusClient
      .joinById<MyRoomState>(id.toLowerCase(), {
        playerName: name,
        playerClass: selectedClass,
      })
      .then(setCurrentRoom)
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        connecting = false;
      });
  }, [id, name, selectedClass]);

  return (
    <div>
      <div className="w-full flex flex-row justify-stretch join">
        <input
          type="text"
          className="input flex-1 uppercase join-item"
          placeholder="Room ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button
          className={twMerge("btn join-item", id && "btn-primary")}
          onClick={pressJoin}
        >
          Join
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}

function RoomSettings({
  roomType,
  onBack,
}: {
  roomType: "singlePlayer" | "multiPlayer";
  onBack: () => void;
}) {
  const { selectedClass, name } = useCharacterCustomizationStore();

  const [mapId, setMapId] = useState<string>("");
  const [mapName, setMapName] = useState<string>("Random Official Map");

  const [mapSelectorOpen, setMapSelectorOpen] = useState(false);

  const pressCreate = useCallback(() => {
    if (connecting) return;
    connecting = true;
    colyseusClient
      .create<MyRoomState>("my_room", {
        quickPlay: false,
        maxPlayers: roomType === "singlePlayer" ? 1 : 10,
        isPrivate: true,
        waveStartType: "playerCount",
        requiredPlayerCount: roomType === "singlePlayer" ? 1 : 2,
        mapId: mapId || undefined,

        playerName: name,
        playerClass: selectedClass,
      })
      .then(setCurrentRoom)
      .finally(() => {
        connecting = false;
      });
  }, [name, selectedClass, roomType, mapId]);
  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="flex flex-row gap-2 items-center">
        <h3 className="text-white font-bold text-2xl">
          {roomType == "multiPlayer" ? "Room" : "Single Player"} Settings
        </h3>
      </div>

      <div className="flex flex-row items-center gap-3">
        <h4 className="text-white font-bold text-lg">Map: {mapName}</h4>
        <button
          className="btn text-sm p-1 px-2"
          onClick={() => {
            setMapSelectorOpen(true);
          }}
        >
          Select Map
        </button>
      </div>

      <button onClick={pressCreate} className="btn btn-primary">
        Create Room
      </button>
      <button onClick={onBack} className="btn btn-secondary">
        Back
      </button>
      <MapSelector
        open={mapSelectorOpen}
        onClose={() => setMapSelectorOpen(false)}
        onSelect={(mapId, mapName) => {
          setMapId(mapId);
          setMapName(mapName);
        }}
      />
    </div>
  );
}
