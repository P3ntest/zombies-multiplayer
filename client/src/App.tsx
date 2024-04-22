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

  // useEffect(() => {
  //   if (!room) {
  //     if (connecting) {
  //       return;
  //     }
  //     connecting = true;
  //     colyseusClient
  //       .joinOrCreate<MyRoomState>("my_room", {})
  //       .then((room) => {
  //         setCurrentRoom(room);
  //       })
  //       .finally(() => {
  //         connecting = false;
  //       });
  //   }
  // }, [room]);

  if (!room) {
    return <Menu />;
  }

  // if (!room) {
  //   return (
  //     <div>
  //       <button onClick={() => connectToColyseus("my_room", {})}>
  //         Connect
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div>
      {/* <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        id="debug"
      ></div> */}

      <MainStage />
    </div>
  );
}
