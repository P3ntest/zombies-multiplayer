import { Room, Client } from "@colyseus/core";
import { BulletState, MyRoomState, PlayerState } from "./schema/MyRoomState";

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

    this.onMessage("shoot", (client, message) => {
      const { originX, originY, rotation, speed } = message;

      const bullet = new BulletState();
      bullet.id = Math.random().toString(36).substring(7);
      bullet.playerId = client.sessionId;
      bullet.originX = originX;
      bullet.originY = originY;
      bullet.rotation = rotation;
      bullet.speed = speed;

      this.state.bullets.push(bullet);
    });

    this.onMessage("destroyBullet", (client, message) => {
      const index = this.state.bullets.findIndex((b) => b.id === message.id);
      this.state.bullets.splice(index, 1);
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
