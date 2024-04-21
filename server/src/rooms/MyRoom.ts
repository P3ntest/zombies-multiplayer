import { Room, Client } from "@colyseus/core";
import {
  BulletState,
  MyRoomState,
  PlayerState,
  ZombieState,
} from "./schema/MyRoomState";
import { genId } from "../util";
import { WaveManager } from "../game/WaveManager";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  waveManager = new WaveManager(this);

  onCreate(options: any) {
    this.setState(new MyRoomState());
    this.clock.start();

    this.waveManager.init();

    this.clock.setInterval(() => {
      this.state.gameTick++;
      this.broadcast("gameTick", this.state.gameTick);
    }, 1000 / 20);

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.id);
      const { x, y, rotation, velocityX, velocityY } = message;
      player.x = x;
      player.y = y;
      player.velocityX = velocityX;
      player.velocityY = velocityY;
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
        this.waveManager.checkWaveEnd();
      }

      this.broadcast("zombieHit", { zombieId, bulletId });

      const bulletIndex = this.state.bullets.findIndex(
        (b) => b.id === bulletId
      );
      this.state.bullets.splice(bulletIndex, 1);
    });

    this.onMessage("zombieAttackPlayer", (client, message) => {
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
      if (player.health <= 0) {
        this.broadcast("playerDied", { playerId });
      }
    });

    this.onMessage("spawnZombie", (client, message) => {
      const { x, y } = message;
      const zombie = new ZombieState();
      zombie.id = genId();
      zombie.x = x;
      zombie.y = y;
      zombie.rotation = Math.random() * Math.PI * 2;
      zombie.playerId = client.sessionId;
      this.state.zombies.push(zombie);
      this.broadcast("spawnZombie", { id: zombie.id });
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

  requestSpawnZombie() {
    // find a player which has the least number of zombies
    const players = this.state.players;
    const playerIds = Array.from(players.keys());
    const playerZombieCounts = new Map<string, number>();
    for (const zombie of this.state.zombies) {
      const count = playerZombieCounts.get(zombie.playerId) || 0;
      playerZombieCounts.set(zombie.playerId, count + 1);
    }

    let minCount = Infinity;
    let targetPlayerId = "";
    for (const playerId of playerIds) {
      const count = playerZombieCounts.get(playerId) || 0;
      if (count < minCount) {
        minCount = count;
        targetPlayerId = playerId;
      }
    }

    const client = this.clients.find((c) => c.sessionId === targetPlayerId);
    client.send("requestSpawnZombie");
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
