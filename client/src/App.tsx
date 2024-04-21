import { useEffect } from "react";
import { connectToColyseus, useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { PhysicsProvider } from "./lib/physics/PhysicsProvider";
import { useControlEventListeners } from "./lib/useControls";

export function App() {
  const room = useColyseusRoom();

  useControlEventListeners();

  useEffect(() => {
    if (!room) {
      connectToColyseus("my_room", {});
    }
  }, [room]);

  if (!room) {
    return null;
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
