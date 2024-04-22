import { useEffect } from "react";
import { colyseusClient, setCurrentRoom, useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { useControlEventListeners } from "./lib/useControls";
import { MyRoomState } from "../../server/src/rooms/schema/MyRoomState";
import { Menu } from "./components/ui/Menu";

let connecting = false;

export function App() {
  const room = useColyseusRoom();

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
