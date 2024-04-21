import { useColyseusState } from "../../colyseus";
import { PlayerHealthState } from "../../../../server/src/rooms/schema/MyRoomState";

export function usePlayers() {
  const playerMap = useColyseusState((state) => state.players);
  return playerMap ? Array.from(playerMap.values()) : [];
}

export function useAlivePlayers() {
  const players = usePlayers();
  return players.filter(
    (player) => player.healthState == PlayerHealthState.ALIVE
  );
}
