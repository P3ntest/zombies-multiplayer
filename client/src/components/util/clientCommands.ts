import { useCallback } from "react";
import { disconnectFromColyseus, useColyseusRoom } from "../../colyseus";
import { useCharacterCustomizationStore } from "../ui/characterCusotmizationStore";

export function useClientCommandInterceptor() {
  return useCallback((message: string) => {
    if (!message.startsWith("/")) return message;
    const command = message.substring(1).split(" ")[0];
    switch (command) {
      case "disconnect":
      case "leave":
        disconnectFromColyseus();
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
