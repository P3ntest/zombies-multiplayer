import { useEffect } from "react";
import { colyseusClient, setCurrentRoom, useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { useControlEventListeners } from "./lib/useControls";
import { MyRoomState } from "../../server/src/rooms/schema/MyRoomState";
import { Menu } from "./components/ui/Menu";
import { useTryJoinByQueryOrReconnectToken } from "./lib/networking/hooks";

export function App() {
  const room = useColyseusRoom();
  useTryJoinByQueryOrReconnectToken();

  useControlEventListeners();

  if (!room) {
    return <Menu />;
  }

  return (
    <div
      style={{
        cursor: "crosshair",
      }}
    >
      <MainStage />
    </div>
  );
}
