import { useEffect } from "react";
import { useUIStore } from "./uiStore";
import { disconnectFromColyseus } from "../../colyseus";
import { useClientSettings } from "./soundStore";

export function EscapeScreen() {
  const { volume, setVolume } = useClientSettings();

  const { escapeOpen: open, setEscapeOpen: setOpen } = useUIStore();

  const otherMenuOpen = useUIStore(
    (state) => state.buyMenuOpen || state.chatOpen
  );

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
  }, [open, otherMenuOpen, setOpen]);

  if (!open) {
    return null;
  }

  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-slate-500 bg-opacity-80 flex items-center justify-center cursor-default pointer-events-auto">
      <div className="bg-slate-800 p-6 rounded-lg">
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
            className="btn btn-secondary"
            onClick={() => disconnectFromColyseus()}
          >
            Leave Game
          </button>
        </div>
      </div>
    </div>
  );
}
