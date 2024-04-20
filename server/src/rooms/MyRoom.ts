import { Room, Client } from "@colyseus/core";
import { MyRoomState, PlayerState } from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new MyRoomState());

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.id);
      const { x, y, rotation } = message;
      player.x = x;
      player.y = y;
      player.rotation = rotation;
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const playerState = new PlayerState();
    playerState.name = "Player " + client.sessionId;
    playerState.sessionId = client.sessionId;
    playerState.x = Math.floor(Math.random() * 800);
    playerState.y = Math.floor(Math.random() * 600);
    this.state.players.set(client.id, playerState);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.id);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }
}
