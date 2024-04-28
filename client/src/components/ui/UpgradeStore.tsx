import { useEffect } from "react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useSelf } from "../../lib/networking/hooks";
import { CoinSymbol } from "./GameUI";
import { useUIStore } from "./uiStore";
import { calcUpgrade, upgradeConfig } from "../../../../server/src/game/config";

export function UpgradeStore() {
  const { buyMenuOpen: open, setBuyMenuOpen: setOpen } = useUIStore();
  const chatOpen = useUIStore((s) => s.chatOpen);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (chatOpen) return;
      if (e.key === "b" || e.key === "B") {
        setOpen(!open);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [setOpen, open, chatOpen]);

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
      className="bg-slate-800 bg-opacity-50 p-4 rounded-lg select-none"
      style={{
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-white font-bold text-2xl text-center mb-5">
        Upgrade Store
      </h3>
      <div className="grid grid-cols-3 gap-4">
        {upgradeConfig.map((upgrade) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const level = ((upgrades as any)[upgrade.id] as number) ?? 0;
          return (
            <div key={upgrade.id} className="bg-slate-700 p-4 rounded-lg">
              <h4 className="text-white font-bold text-xl">{upgrade.name}</h4>
              <p className="text-white text-lg">
                Level: {level} / {upgrade.maxLevel}
              </p>
              <button
                className="btn flex flex-row items-center m-auto"
                disabled={
                  level >= upgrade.maxLevel ||
                  coins < calcUpgrade(upgrade.cost, level)
                }
                onClick={() => {
                  room?.send("buyUpgrade", {
                    upgradeType: upgrade.id,
                    coins: calcUpgrade(upgrade.cost, level),
                  });
                }}
              >
                {ButtonContent(
                  calcUpgrade(upgrade.cost, level),
                  level,
                  upgrade.maxLevel
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ButtonContent(upgardeCost: number, level: number, maxLevel: number) {
  if (level >= maxLevel) {
    return <div>MAX</div>;
  }
  if (upgardeCost === 0) {
    return <div>Free</div>;
  }
  return (
    <div className="flex flex-row items-center ">
      <div>{upgardeCost}</div>
      <div className="pl-1 pr-2">
        <CoinSymbol />
      </div>
      <div>Upgrade</div>
    </div>
  );
}
