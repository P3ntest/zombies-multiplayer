import { useMemo } from "react";
import { useLevel } from "./levelContext";

export function useSpawnPoints(type: "player" | "zombie") {
  const objects = useLevel().level.objects;

  const spawnPoints = useMemo(() => {
    return objects.filter(
      (object) => object.objectType === "spawnPoint" && object.spawns === type
    );
  }, [objects, type]);

  return spawnPoints;
}
