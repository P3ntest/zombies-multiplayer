import { useEffect, useState } from "react";
import { GameLevel } from "../../../../server/src/game/mapEditor/editorTypes";
import { trpc } from "../../lib/trpc/trpcClient";
import { useColyseusRoom, useColyseusState } from "../../colyseus";

export function useRemoteLevel(mapId: string | undefined) {
  const [level, setLevel] = useState<GameLevel | null>(null);
  const room = useColyseusRoom();
  useEffect(() => {
    if (mapId && !level) {
      console.log("loading map", mapId);
      trpc.maps.loadMap.query(mapId).then((level) => {
        setLevel(level.level);
        room?.send("finishedLoading");
      });
    }
  }, [mapId, level, room]);

  return level;
}

export function useCurrentRemoteLevel() {
  const mapId = useColyseusState((state) => state.mapId);
  const level = useRemoteLevel(mapId);

  return level;
}
