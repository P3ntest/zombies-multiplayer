import { createContext, useContext, useMemo } from "react";

export type SpawnPoint = {
  x: number;
  y: number;
  type: "player" | "zombie";
};
interface SpawnPointContext {
  spawnPoints: Record<string, SpawnPoint>;
  setSpawnPoint: (id: string, point: SpawnPoint) => void;
  removeSpawnPoint: (id: string) => void;
}

export const ZombieSpawnPointContext = createContext<SpawnPointContext>({
  spawnPoints: {},
  setSpawnPoint: () => {},
  removeSpawnPoint: () => {},
});

export function useSpawnPoints(type: "player" | "zombie") {
  const { spawnPoints } = useContext(ZombieSpawnPointContext);

  return useMemo(
    () =>
      Object.entries(spawnPoints)
        .filter(([, point]) => point.type === type)
        .map(([, point]) => point),
    [spawnPoints, type]
  );
}
