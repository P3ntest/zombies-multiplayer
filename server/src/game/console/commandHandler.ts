import { Client } from "colyseus";
import { MyRoom } from "../../rooms/MyRoom";

export function handleCommand(room: MyRoom, client: Client, message: string) {
  const command = message.substring(1);
  switch (command) {
    case "help":
      room.sendChatToPlayer(
        client.id,
        "You really thought I would help you? You're on your own.",
        "green"
      );
      break;
    case "suicide":
      room.killPlayer(client.id);
      break;
    default:
      room.sendChatToPlayer(
        client.id,
        "Unknown command. Use /help for a list of available commands",
        "red"
      );
  }
}
