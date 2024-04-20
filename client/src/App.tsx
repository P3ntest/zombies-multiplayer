import { connectToColyseus, useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { useControlEventListeners } from "./lib/useControls";

export function App() {
  const room = useColyseusRoom();

  useControlEventListeners();

  if (!room) {
    return (
      <div>
        <button onClick={() => connectToColyseus("my_room", {})}>
          Connect
        </button>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          zIndex: 100,
        }}
      ></div>
      <MainStage />
    </div>
  );
}
