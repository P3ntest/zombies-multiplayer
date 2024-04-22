import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { useRoomMessageHandler } from "../../lib/networking/hooks";
import { Container, Graphics } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";

// this context will hold all zombie spawn points
interface ZombieSpawnPointContext {
  spawnPoints: Record<string, { x: number; y: number }>;
  setSpawnPoint: (id: string, x: number, y: number) => void;
  removeSpawnPoint: (id: string) => void;
}

const ZombieSpawnPointContext = createContext<ZombieSpawnPointContext>({
  spawnPoints: {},
  setSpawnPoint: () => {},
  removeSpawnPoint: () => {},
});

export function ZombieSpawner({ children }: { children: React.ReactNode }) {
  const [spawnPoints, setSpawnPoints] = useState<
    Record<string, { x: number; y: number }>
  >({});

  const players = useColyseusState((state) => state.players);
  const room = useColyseusRoom();

  const setSpawnPoint = useCallback(
    (id: string, x: number, y: number) => {
      setSpawnPoints((prev) => ({
        ...prev,
        [id]: { x, y },
      }));
    },
    [setSpawnPoints]
  );

  const removeSpawnPoint = useCallback(
    (id: string) => {
      setSpawnPoints((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [setSpawnPoints]
  );

  useRoomMessageHandler("requestSpawnZombie", ({ type }) => {
    // find the spawn point furthest from its nearest player
    const playersList = Array.from(players!.values());
    const spawnPoint = Object.entries(spawnPoints).reduce(
      (acc, [id, { x, y }]) => {
        const distance = playersList.reduce((acc, player) => {
          const playerDistance = Math.hypot(player.x - x, player.y - y);
          return Math.min(acc, playerDistance);
        }, Infinity);

        if (distance > acc.distance) {
          return { id, distance };
        }

        return acc;
      },
      { id: "", distance: -Infinity }
    );

    room?.send("spawnZombie", {
      x: spawnPoints[spawnPoint.id].x,
      y: spawnPoints[spawnPoint.id].y,
      type,
    });
  });

  return (
    <ZombieSpawnPointContext.Provider
      value={{ spawnPoints, setSpawnPoint, removeSpawnPoint }}
    >
      {children}
    </ZombieSpawnPointContext.Provider>
  );
}

export function ZombieSpawnPoint({ x, y }: { x: number; y: number }) {
  const id = useId();

  const { setSpawnPoint, removeSpawnPoint } = useContext(
    ZombieSpawnPointContext
  );

  const containerRef = useRef(null);

  useEffect(() => {
    setSpawnPoint(id, x, y);

    return () => {
      removeSpawnPoint(id);
    };
  }, [id, x, y, setSpawnPoint, removeSpawnPoint]);

  return (
    <Container ref={containerRef} x={x} y={y}>
      {/* <Graphics
        draw={(g) => {
          g.beginFill(0xff0000);
          g.drawRect(0, 0, 10, 10);
          g.endFill();
        }}
      /> */}
    </Container>
  );
}
