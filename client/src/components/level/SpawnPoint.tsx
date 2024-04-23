import { useTick } from "@pixi/react";
import { Container, Graphics } from "@pixi/react";
import { Container as PIXIContainer } from "pixi.js";
import {
  useId,
  useContext,
  useRef,
  useEffect,
  useCallback,
  useState,
} from "react";
import { ZombieSpawnPointContext } from "./spawnPointContext";
import type { SpawnPoint } from "./spawnPointContext";

export function SpawnPoint({
  x,
  y,
  type,
}: {
  x: number;
  y: number;
  type: "player" | "zombie";
}) {
  const id = useId();

  const { setSpawnPoint, removeSpawnPoint } = useContext(
    ZombieSpawnPointContext
  );

  const containerRef = useRef<PIXIContainer>(null);

  const lastUpdatedRef = useRef<SpawnPoint | null>(null);

  useEffect(() => {
    setSpawnPoint(id, { x, y, type });

    return () => {
      removeSpawnPoint(id);
    };
  }, [id, x, y, type, setSpawnPoint, removeSpawnPoint]);

  useTick(() => {
    const container = containerRef.current;
    if (!container) return;

    const worldTransform = container.worldTransform;

    const updated = {
      x: worldTransform.tx,
      y: worldTransform.ty,
      type,
    };

    if (
      !lastUpdatedRef.current ||
      lastUpdatedRef.current.x !== updated.x ||
      lastUpdatedRef.current.y !== updated.y ||
      lastUpdatedRef.current.type !== updated.type
    ) {
      lastUpdatedRef.current = updated;
      setSpawnPoint(id, updated);
    }
  });

  return (
    <Container x={x} y={y}>
      <Container ref={containerRef} />
      {/* <Graphics
        draw={(g) => {
          g.beginFill(type === "zombie" ? 0xff0000 : 0x0000ff);
          g.drawRect(0, 0, 10, 10);
          g.endFill();
        }}
      /> */}
    </Container>
  );
}

export function SpawnPointManager({ children }: { children: React.ReactNode }) {
  const [spawnPoints, setSpawnPoints] = useState<Record<string, SpawnPoint>>(
    {}
  );

  const setSpawnPoint = useCallback(
    (id: string, point: SpawnPoint) => {
      setSpawnPoints((prev) => ({
        ...prev,
        [id]: point,
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

  return (
    <ZombieSpawnPointContext.Provider
      value={{ spawnPoints, setSpawnPoint, removeSpawnPoint }}
    >
      {children}
    </ZombieSpawnPointContext.Provider>
  );
}
