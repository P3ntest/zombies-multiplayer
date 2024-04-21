import { Room, Client } from "@colyseus/core";
import {
  BulletState,
  MyRoomState,
  PlayerState,
  ZombieState,
} from "./schema/MyRoomState";
import { genId } from "../util";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.clock.start();

    this.clock.setInterval(() => {
      this.state.gameTick++;
      this.broadcast("gameTick", this.state.gameTick);
    }, 1000 / 20);

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
      bullet.id = genId();
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

    this.onMessage("updateZombie", (client, message) => {
      const { id, x, y, rotation, targetPlayerId } = message;
      const zombie = this.state.zombies.find((z) => z.id === id);
      if (!zombie) return;

      x && (zombie.x = x);
      y && (zombie.y = y);
      rotation && (zombie.rotation = rotation);
      targetPlayerId != undefined && (zombie.targetPlayerId = targetPlayerId);
    });

    this.onMessage("zombieHit", (client, message) => {
      const { zombieId, bulletId } = message;
      const zombie = this.state.zombies.find((z) => z.id === zombieId);
      if (!zombie) return;

      const bullet = this.state.bullets.find((b) => b.id === bulletId);
      if (!bullet) return;

      zombie.health -= 10;
      if (zombie.health <= 0) {
        const index = this.state.zombies.findIndex((z) => z.id === zombieId);
        this.state.zombies.splice(index, 1);
      }

      this.broadcast("zombieHit", { zombieId, bulletId });

      const bulletIndex = this.state.bullets.findIndex(
        (b) => b.id === bulletId
      );
      this.state.bullets.splice(bulletIndex, 1);
    });

    this.onMessage("zombieAttackPlayer", (client, message) => {
      console.log("zombie attack player");
      const { playerId, zombieId } = message;
      const player = this.state.players.get(playerId);
      if (!player) return;

      const zombie = this.state.zombies.find((z) => z.id === zombieId);
      if (!zombie) return;

      if (
        zombie.attackCoolDownTicks + zombie.lastAttackTick >=
        this.state.gameTick
      ) {
        return;
      }

      zombie.lastAttackTick = this.state.gameTick;

      this.broadcast("zombieAttackPlayer", { playerId, zombieId });

      player.health -= 10;
      console.log("player health", player.health);
      if (player.health <= 0) {
        this.broadcast("playerDied", { playerId });
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const playerState = new PlayerState();
    playerState.name = "Player " + client.sessionId;
    playerState.sessionId = client.sessionId;
    playerState.x = Math.floor(Math.random() * 800);
    playerState.y = Math.floor(Math.random() * 600);
    playerState.health = 100;
    this.state.players.set(client.id, playerState);

    const zombieState = new ZombieState();
    zombieState.id = genId();
    zombieState.x = Math.floor(Math.random() * 800);
    zombieState.y = Math.floor(Math.random() * 600);
    zombieState.rotation = Math.random() * Math.PI * 2;
    zombieState.playerId = client.sessionId;
    this.state.zombies.push(zombieState);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.id);

    this.ensureZombieControl();
    this.removeOrphanBullets();
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  removeOrphanBullets() {
    const players = this.state.players;
    this.state.bullets = this.state.bullets.filter((bullet) =>
      players.has(bullet.playerId)
    );
  }

  ensureZombieControl() {
    const zombies = this.state.zombies;
    const players = this.state.players;

    for (const zombie of zombies) {
      if (!players.has(zombie.playerId)) {
        const playerIds = Array.from(players.keys());
        const randomPlayerId =
          playerIds[Math.floor(Math.random() * playerIds.length)];
        zombie.playerId = randomPlayerId;
      }
    }
  }
}
