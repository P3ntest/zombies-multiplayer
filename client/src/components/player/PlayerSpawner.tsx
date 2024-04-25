import { useColyseusRoom } from "../../colyseus";
import { useRoomMessageHandler } from "../../lib/networking/hooks";
import { useSpawnPoints } from "../level/spawnPointContext";

export function PlayerSpawner() {
  const room = useColyseusRoom();
  const spawnPoints = useSpawnPoints("player");
  useRoomMessageHandler("requestSpawn", () => {
    const spawnPoint =
      spawnPoints[Math.floor(Math.random() * spawnPoints.length)];

    room?.send("spawnSelf", {
      x: spawnPoint.x,
      y: spawnPoint.y,
    });
  });

  return null;
}
