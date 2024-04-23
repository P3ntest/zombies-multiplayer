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
import { PlayerState } from "../../../../server/src/rooms/schema/MyRoomState";

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
    const playersList = Array.from(players!.values());

    // calculate the distance to the closest player for all spawn points
    const spawnPointDistances = Object.entries(spawnPoints)
      .map(([, { x, y }]) => {
        const closestPlayer = playersList.reduce(
          (closest, player) => {
            const distance = Math.hypot(player.x - x, player.y - y);
            if (distance < closest.distance) {
              return { player, distance };
            }
            return closest;
          },
          { player: undefined as undefined | PlayerState, distance: Infinity }
        );

        return { x, y, distance: closestPlayer.distance };
      })
      .sort((a, b) => a.distance - b.distance);

    const MIN_DISTANCE = 1500;
    const spawnPoint =
      spawnPointDistances.find((point) => point.distance > MIN_DISTANCE) ??
      spawnPointDistances[0];

    room?.send("spawnZombie", {
      x: spawnPoint.x,
      y: spawnPoint.y,
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
