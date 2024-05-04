import { Client } from "colyseus";
import { MyRoom } from "../../rooms/MyRoom";

export function handleCommand(room: MyRoom, client: Client, message: string) {
  const command = message.split(" ")[0].substring(1);

  const canDev = () => {
    if (process.env.NODE_ENV === "development") return true;
    room.sendChatToPlayer(
      client.id,
      "This command is only available in development mode",
      "red"
    );
    return false;
  };

  switch (command) {
    case "help":
      room.sendChatToPlayer(
        client.id,
        "You really thought I would help you? You're on your own.",
        "green"
      );
      break;
    case "/money": // commands starting with two slashes are for cheating and only in development
      if (!canDev()) return;
      room.state.players.get(client.id).skillPoints += 1000;
      break;
    case "/spawn": {
      if (!canDev()) return;
      const spawnType = message.split(" ")[1] || "normal";
      switch (spawnType) {
        case "normal":
        case "tank":
        case "baby":
        case "greenMutant":
        case "mutatedBaby":
        case "blueMutant":
          room.requestSpawnZombie(undefined, spawnType);
          break;
        default:
          room.sendChatToPlayer(client.id, "Unknown spawn type", "red");
      }
      break;
    }
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
