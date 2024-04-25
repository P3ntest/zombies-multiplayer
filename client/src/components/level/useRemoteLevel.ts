import { useEffect, useState } from "react";
import { GameLevel } from "../../../../server/src/game/mapEditor/editorTypes";
import { trpc } from "../../lib/trpc/trpcClient";
import { useColyseusRoom, useColyseusState } from "../../colyseus";

export function useRemoveLevel(mapId: string | undefined) {
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

export function useCurrentRemoveLevel() {
  const mapId = useColyseusState((state) => state.mapId);
  const level = useRemoveLevel(mapId);

  return level;
}
