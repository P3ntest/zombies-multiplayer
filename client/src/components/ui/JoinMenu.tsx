import { useCallback, useState } from "react";
import { colyseusClient, setCurrentRoom } from "../../colyseus";
import { MyRoomState } from "../../../../server/src/rooms/schema/MyRoomState";

let connecting = false;

export function JoinMenu() {
  const [stage, setStage] = useState<
    "start" | "createRoom" | "joinId" | "roomsList"
  >("start");

  const pressQuickPlay = useCallback(() => {
    if (connecting) return;
    connecting = true;
    colyseusClient
      .joinOrCreate<MyRoomState>("my_room", {
        quickPlay: true,
      })
      .then(setCurrentRoom)
      .finally(() => {
        connecting = false;
      });
  }, []);

  const pressSinglePlayer = useCallback(() => {
    if (connecting) return;
    connecting = true;
    colyseusClient
      .joinOrCreate<MyRoomState>("my_room", {
        quickPlay: false,
        maxPlayers: 1,
        isPrivate: true,
        waveStartType: "playerCount",
        requiredPlayerCount: 1,
      })
      .then(setCurrentRoom)
      .finally(() => {
        connecting = false;
      });
  }, []);

  const createRoom = useCallback(() => {
    if (connecting) return;
    connecting = true;
    colyseusClient
      .create<MyRoomState>("my_room", {
        quickPlay: false,
        maxPlayers: 10,
        isPrivate: true,
        waveStartType: "playerCount",
        requiredPlayerCount: 2,
      })
      .then(setCurrentRoom)
      .finally(() => {
        connecting = false;
      });
  }, []);

  return (
    <div className="bg-slate-700 bg-opacity-70 p-10 rounded-xl h-full">
      {stage === "start" && (
        <div className="w-full flex flex-col items-center gap-10">
          <h3 className="text-white font-bold text-2xl">Join a game</h3>
          <div className="flex flex-col gap-4 w-80">
            <button
              className="button"
              disabled={connecting}
              onClick={pressQuickPlay}
            >
              QuickPlay
            </button>
            <button
              className="button"
              disabled={connecting}
              onClick={pressSinglePlayer}
            >
              Single Player
            </button>
            <button
              className="button"
              disabled={connecting}
              onClick={createRoom}
            >
              Create Room
            </button>
            <JoinByIdField />
          </div>
        </div>
      )}
    </div>
  );
}

function JoinByIdField() {
  const [error, setError] = useState<string | null>(null);

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
      .joinById<MyRoomState>(id.toLowerCase())
      .then(setCurrentRoom)
      .catch((e) => {
        setError(e.message);
      })
      .finally(() => {
        connecting = false;
      });
  }, [id]);

  return (
    <div>
      <div className="w-full flex flex-row justify-stretch gap-4">
        <input
          type="text"
          className="button flex-1 bg-slate-700 border-slate-800 border-2"
          placeholder="Room ID"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <button className="button" onClick={pressJoin}>
          Join
        </button>
      </div>
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}
