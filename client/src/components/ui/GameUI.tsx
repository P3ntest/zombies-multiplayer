import { useCallback, useEffect, useState } from "react";
import { useRoomMessageHandler, useSelf } from "../../lib/networking/hooks";
import { playWaveStart } from "../../lib/sound/sound";
import { useColyseusState } from "../../colyseus";
import { UpgradeStore } from "./UpgradeStore";
import { EscapeScreen } from "./EscapeScreen";
import { Chat } from "./Chat";
import { LeaderBoard } from "./LeaderBoard";

const TITLE_DURATION = 4000;

export function GameUI() {
  const [waveTitle, setWaveTitle] = useState<string | null>(null);

  const showTitle = useCallback((title: string) => {
    setWaveTitle(title);
    setTimeout(() => {
      setWaveTitle(null);
    }, TITLE_DURATION);
  }, []);

  useRoomMessageHandler("waveStart", (message) => {
    const { wave } = message;
    showTitle(`Wave ${wave}`);
    playWaveStart();
  });

  useRoomMessageHandler("waveEnd", (message) => {
    const { wave } = message;
    showTitle(`Wave ${wave} complete!`);
  });

  useRoomMessageHandler("gameOver", () => {
    showTitle("Game Over!");
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 100,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
      }}
    >
      {waveTitle && <WaveTitle title={waveTitle} key={waveTitle} />}
      <WaveInfo />
      <CoinInfo />
      <UpgradeStore />
      <EscapeScreen />
      <Chat />
      <LeaderBoard />
    </div>
  );
}

function CoinInfo() {
  const me = useSelf();
  const coins = me?.coins ?? 0;
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        zIndex: 100,
        color: "white",
        textShadow: "3px 5px 2px #474747",
        fontSize: 24,
        padding: 20,
      }}
      className="ui-text flex flex-row items-center gap-2"
    >
      {coins} <CoinSymbol />
    </div>
  );
}

export function CoinSymbol() {
  return (
    <img
      src="assets/coin.png"
      style={{
        width: "1.2rem",
        height: "1.2rem",
      }}
      alt=""
    />
  );
}

function WaveInfo() {
  const zombiesCount = useColyseusState((state) => state.zombies.length);
  const waveInfo = useColyseusState((state) => state.waveInfo);

  const title =
    waveInfo?.currentWaveNumber == 0
      ? "Waiting to start..."
      : `Wave ${waveInfo?.currentWaveNumber}` +
        (!waveInfo?.active ? " complete!" : "");

  const subtitle = waveInfo?.active
    ? `Remaining Zombies: ${zombiesCount}`
    : `Next wave in ${waveInfo?.nextWaveStartsInSec} seconds`;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 100,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        color: "white",
        textShadow: "3px 5px 2px #474747",
        fontSize: 24,
        padding: 20,
      }}
      className="flex flex-col items-center"
    >
      <div className="ui-text text-2xl">{title}</div>
      <div className="ui-text text-lg">{subtitle}</div>
    </div>
  );
}

function WaveTitle({ title }: { title: string }) {
  const [scale, setScale] = useState(0);
  useEffect(() => {
    setTimeout(() => {
      setScale(1);
    }, 10);
    setTimeout(() => {
      setScale(0);
    }, TITLE_DURATION - 500);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: `translate(-50%, -50%) scale(${scale})`,
        transition: "transform 0.5s",
      }}
      className="text-5xl font-extrabold ui-text"
    >
      {title}
    </div>
  );
}
