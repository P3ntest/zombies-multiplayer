import { useCallback } from "react";
import { disconnectFromColyseus } from "../../colyseus";
import { trpc } from "../../lib/trpc/trpcClient";

export function useClientCommandInterceptor(
  respond: ({ message }: { message: string; color?: string }) => void
) {
  const testConnection = trpc.testConnection.useMutation();
  return useCallback(
    (message: string) => {
      if (!message.startsWith("/")) return message;
      const command = message.substring(1).split(" ")[0];
      switch (command) {
        case "disconnect":
        case "leave":
          disconnectFromColyseus();
          break;
        case "test":
          testConnection.mutateAsync().then((msg) => respond({ message: msg }));
          break;
        default:
          return message;
      }
    },
    [respond, testConnection]
  );
}

// function useJoinCommand() {
//   const room = useColyseusRoom();
//   const { name, selectedClass } = useCharacterCustomizationStore();

//   return useCallback(async () => {
//     await disconnectFromColyseus().catch(console.error);
//   }, [room]);
// }
