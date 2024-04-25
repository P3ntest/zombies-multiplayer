import { useCallback, useEffect, useState } from "react";
import { useUIStore } from "./uiStore";
import { disconnectFromColyseus, useColyseusRoom } from "../../colyseus";
import { useVolumeStore } from "./soundStore";
import { useNavigate } from "react-router-dom";

export function EscapeScreen() {
  const { volume, setVolume } = useVolumeStore();

  const [open, setOpen] = useState(false);
  const otherMenuOpen = useUIStore(
    (state) => state.buyMenuOpen || state.chatOpen
  );

  const onLeave = useCallback(() => {
    localStorage.removeItem("reconnectToken");
    disconnectFromColyseus(true);
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (otherMenuOpen) return;
      if (e.key === "Escape") {
        setOpen(!open);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, otherMenuOpen]);

  if (!open) {
    return null;
  }

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-slate-500 bg-opacity-80 flex items-center justify-center cursor-auto">
      <div className="bg-slate-800 p-6 rounded-lg pointer-events-auto">
        <div className="flex flex-row items-center justify-between gap-5">
          <h1 className="text-2xl text-white font-bold">Escape Menu</h1>
          <div
            className="text-white cursor-pointer font-black hover:scale-125 transition-all"
            onClick={() => {
              setOpen(false);
            }}
          >
            X
          </div>
        </div>
        <div className="flex flex-col gap-3 mt-5">
          <label
            htmlFor="default-range"
            className="block mb-2 text-md font-medium text-gray-900 dark:text-white"
          >
            Volume
          </label>
          <input
            id="default-range"
            type="range"
            value={volume}
            min={0}
            max={1}
            step={0.01}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
          />
        </div>
        <div className="flex flex-col gap-3 mt-5">
          <button
            className="bg-red-500 text-white px-4 py-2 rounded-lg"
            onClick={onLeave}
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
