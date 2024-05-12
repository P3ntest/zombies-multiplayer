import { useCallback, useEffect, useState } from "react";
import { useRoomMessageHandler, useSelf } from "../../lib/networking/hooks";
import { playWaveStart } from "../../lib/sound/sound";
import { disconnectFromColyseus, useColyseusState } from "../../colyseus";
import { UpgradeStore } from "./UpgradeStore";
import { EscapeScreen } from "./EscapeScreen";
import { Chat } from "./Chat";
import { LeaderBoard } from "./LeaderBoard";
import { useUIStore } from "./uiStore";
import { Joystick } from "react-joystick-component";
import { useControlsStore } from "../../lib/useControls";

const TITLE_DURATION = 4000;

export function GameUI() {
  const [waveTitle, setWaveTitle] = useState<string | null>(null);
  const [gameOver, setGameOver] = useState<boolean>(false);

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
    setGameOver(true);
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
      }}
      onTouchStart={() => setTouch(true)}
    >
      <TouchInterface />
      {waveTitle && <WaveTitle title={waveTitle} key={waveTitle} />}
      {gameOver && <GameOverScreen />}
      <WaveInfo />
      <SkillPointInfo />
      <UpgradeStore />
      <EscapeScreen />
      <Chat />
      {!gameOver && <LeaderBoard gameOver={false} />}
    </div>
  );
}

function SkillPointInfo() {
  const me = useSelf();
  const skillPoints = me?.skillPoints ?? 0;
  const { buyMenuOpen: open, setBuyMenuOpen: setOpen } = useUIStore();

  return (
    <button
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
      className="ui-text flex flex-row items-center gap-2 pointer-events-auto"
      onClick={() => {
        setOpen(!open);
      }}
    >
      {skillPoints} <SkillPointSymbol />
    </button>
  );
}

export function SkillPointSymbol() {
  return (
    <img
      src="assets/ui/skillPoint.png"
      style={{
        width: "2.5rem",
        height: "2.5rem",
      }}
      alt=""
    />
  );
}

function WaveInfo() {
  const waveInfo = useColyseusState((state) => state.waveInfo);

  const title =
    waveInfo?.currentWaveNumber == 0
      ? "Waiting to start..."
      : `Wave ${waveInfo?.currentWaveNumber}` +
        (!waveInfo?.active ? " complete!" : "");

  const subtitle = waveInfo?.active
    ? waveInfo?.zombiesLeft / waveInfo?.totalZombies < 0.1
      ? `${waveInfo?.zombiesLeft} zombies left`
      : ""
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
      <progress
        className="progress progress-error w-56 mt-2"
        value={waveInfo.zombiesLeft}
        max={waveInfo.totalZombies}
      ></progress>
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

function GameOverScreen() {
  return (
    <div className="w-screen h-screen fixed top-0 left-0 bg-slate-500 bg-opacity-80 flex items-center justify-center cursor-auto pointer-events-auto">
      <div className="p-6 rounded-lg">
        <div className="flex flex-row items-center justify-between gap-5">
          <div className="text-9xl font-extrabold ui-text">Game Over!</div>
        </div>
        <div className="flex flex-col items-center justify-between gap-5">
          <LeaderBoard gameOver={true} />
        </div>
        <div className="flex flex-col items-center gap-3 mt-5">
          <button
            className="btn btn-secondary"
            onClick={() => disconnectFromColyseus()}
          >
            Back To Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

function TouchInterface() {
  const { setEscapeOpen: setOpen } = useUIStore();

  const controlStore = useControlsStore();

  const handleMove = useCallback(
    (direction) => {
      controlStore.touchMove = {
        x: direction.x / 1000,
        y: -direction.y / 1000,
      };
    },
    [controlStore]
  );

  const moveStop = useCallback(() => {
    controlStore.touchMove = { x: 0, y: 0 };
  }, [controlStore]);

  const handleLook = useCallback(
    (direction) => {
      controlStore.touchLook = {
        x: direction.x / 1000,
        y: -direction.y / 1000,
      };
    },
    [controlStore]
  );

  const lookStop = useCallback(() => {
    controlStore.touchLook = { x: 0, y: 0 };
  }, [controlStore]);

  return (
    <div>
      {controlStore.touch && (
        <div>
          <button
            className="btn btn-outline btn-square btn-sm top-0 left-0 m-4 "
            onClick={() => {
              setOpen(true);
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="opacity-25">
            <div className="absolute left-28 top-3/4">
              <Joystick size={100} move={handleMove} stop={moveStop}></Joystick>
            </div>
            <div className="absolute right-28 top-3/4">
              <Joystick size={100} move={handleLook} stop={lookStop}></Joystick>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function setTouch(touch: boolean) {
  if (touch) {
    useControlsStore.setState((state) => {
      state.keysDown.clear();
      return state;
    });
  }
  useControlsStore.setState((state) => {
    state.touch = touch;
    return state;
  });
}
