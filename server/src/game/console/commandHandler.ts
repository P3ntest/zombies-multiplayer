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
    case "/money": // commands starting with two slashes are for cheating and only in development
      if (process.env.NODE_ENV !== "development") {
        room.sendChatToPlayer(
          client.id,
          "This command is only available in development mode",
          "red"
        );
        return;
      }
      room.state.players.get(client.id).skillPoints += 1000;
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
