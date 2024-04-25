import { useCallback } from "react";
import { disconnectFromColyseus } from "../../colyseus";
import { trpc } from "../../lib/trpc/trpcClient";

export function useClientCommandInterceptor() {
  return useCallback((message: string) => {
    if (!message.startsWith("/")) return message;
    const command = message.substring(1).split(" ")[0];
    switch (command) {
      case "disconnect":
      case "leave":
        disconnectFromColyseus();
        break;
      case "test":
        trpc.helloWorld.query().then(console.log);
        break;
      default:
        return message;
    }
  }, []);
}

// function useJoinCommand() {
//   const room = useColyseusRoom();
//   const { name, selectedClass } = useCharacterCustomizationStore();

//   return useCallback(async () => {
//     await disconnectFromColyseus().catch(console.error);
//   }, [room]);
// }
