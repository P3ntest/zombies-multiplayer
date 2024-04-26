import { useCallback } from "react";
import { disconnectFromColyseus, useColyseusState } from "../../colyseus";
import { trpc } from "../../lib/trpc/trpcClient";

export function useClientCommandInterceptor(
  respond: ({ message }: { message: string; color?: string }) => void
) {
  const testConnection = trpc.testConnection.useMutation();
  const verifyMap = trpc.maps.verifyMap.useMutation();
  const currentMapId = useColyseusState((state) => state.mapId);

  return useCallback(
    (message: string) => {
      if (!message.startsWith("/")) return message;
      const command = message.substring(1).split(" ")[0].toLowerCase();
      switch (command) {
        case "disconnect":
        case "leave":
          disconnectFromColyseus();
          break;
        case "test":
          testConnection.mutateAsync().then((msg) => respond({ message: msg }));
          break;
        case "verifymap":
          if (!currentMapId) {
            return respond({
              message: "You must be in a map to verify it",
              color: "red",
            });
          }
          verifyMap
            .mutateAsync({
              mapId: currentMapId,
              verify: true,
            })
            .then((msg) => respond({ message: msg }));
          break;
        default:
          return message;
      }
    },
    [respond, testConnection, currentMapId, verifyMap]
  );
}
