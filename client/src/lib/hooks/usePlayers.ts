import { useMemo } from "react";
import { useColyseusState } from "../../colyseus";
import { PlayerHealthState } from "../../../../server/src/rooms/schema/MyRoomState";

export function usePlayers() {
  const playerMap = useColyseusState((state) => state.players);
  return useMemo(
    () => (playerMap ? Array.from(playerMap.values()) : []),
    [playerMap]
  );
}

export function useAlivePlayers() {
  const players = usePlayers();
  return useMemo(
    () =>
      players.filter((player) => player.healthState == PlayerHealthState.ALIVE),
    [players]
  );
}
