import { useEffect, useState } from "react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useSelf } from "../../lib/networking/hooks";
import { CoinSymbol } from "./GameUI";

const upgradeTypes = [
  {
    id: "damage",
    name: "Damage",
    maxLevel: 10,
    cost: (level: number) => Math.pow(2, level) * 10,
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    maxLevel: 5,
    cost: (level: number) => Math.pow(2, level) * 10,
  },
];

export function UpgradeStore() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "b") {
        setOpen((value) => !value);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  if (!open) {
    return null;
  }
  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        width: "100vw",
        height: "100vh",
        pointerEvents: "auto",
      }}
      className="flex items-center justify-center"
    >
      <StoreModal />
    </div>
  );
}

function StoreModal() {
  //TODO: cleaner
  const state = useColyseusState();
  const sessionId = useSelf()?.sessionId;

  const upgrades = state?.players?.get(sessionId!)?.upgrades ?? {};
  const coins = state?.players?.get(sessionId!)?.coins ?? 0;

  const room = useColyseusRoom();

  if (!open) {
    return null;
  }

  return (
    <div
      className="bg-slate-800 bg-opacity-50 p-4 rounded-lg"
      style={{
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white font-bold text-2xl text-center mb-5">
        Upgrade Store
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {upgradeTypes.map((upgrade) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const level = ((upgrades as any)[upgrade.id] as number) ?? 0;
          return (
            <div key={upgrade.id} className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-bold text-xl">{upgrade.name}</h4>
              <p className="text-white text-lg">
                Level: {level} / {upgrade.maxLevel}
              </p>
              <button
                className="button flex flex-row items-center"
                disabled={
                  level >= upgrade.maxLevel || coins < upgrade.cost(level)
                }
                onClick={() => {
                  room?.send("buyUpgrade", {
                    upgradeType: upgrade.id,
                    coins: upgrade.cost(level),
                  });
                }}
              >
                {upgrade.cost(level)}
                <div className="pl-1 pr-2">
                  <CoinSymbol />
                </div>
                Upgrade
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
