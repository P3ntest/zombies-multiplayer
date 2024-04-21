import { useCallback, useEffect, useState } from "react";
import { useRoomMessageHandler } from "../../lib/networking/hooks";
import { playWaveStart } from "../../lib/sound/sound";

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
        fontSize: 52,
        color: "white",
        textShadow: "3px 5px 2px #474747",
        fontWeight: "bolder",
        userSelect: "none",
      }}
    >
      {title}
    </div>
  );
}
