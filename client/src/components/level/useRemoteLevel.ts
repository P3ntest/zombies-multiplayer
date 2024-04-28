import { trpc } from "../../lib/trpc/trpcClient";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useEffect } from "react";

export function useRemoteLevel(mapId: string | undefined) {
  const level = trpc.maps.loadMap.useQuery(mapId);

  if (!level.data) {
    return null;
  }

  return level.data;
}

export function useCurrentRemoteLevel() {
  const mapId = useColyseusState((state) => state.mapId);
  const room = useColyseusRoom();
  const level = useRemoteLevel(mapId);

  useEffect(() => {
    if (level) {
      room.send("finishedLoading");
    }
  }, [level, room]);

  return level;
}
