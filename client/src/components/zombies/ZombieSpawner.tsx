import { useRoomMessageHandler } from "../../lib/networking/hooks";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { PlayerState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useSpawnPoints } from "../level/spawnPointContext";

export function ZombieSpawner() {
  const spawnPoints = useSpawnPoints("zombie");

  const players = useColyseusState((state) => state.players);
  const room = useColyseusRoom();
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

  return null;
}
