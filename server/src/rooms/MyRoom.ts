import { Room, Client } from "@colyseus/core";
import {
  BulletState,
  CoinState,
  MyRoomState,
  PlayerHealthState,
  PlayerState,
  ZombieState,
} from "./schema/MyRoomState";
import { genId } from "../util";
import { WaveManager } from "../game/WaveManager";
import { ZombieType, zombieInfo } from "../game/zombies";
import { calculateZombieSpawnType } from "../game/waves";

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
      const { originX, originY, rotation, speed, damage, pierces } = message;

      const bullet = new BulletState();
      bullet.id = genId();
      bullet.playerId = client.sessionId;
      bullet.originX = originX;
      bullet.piercesLeft = pierces;
      bullet.originY = originY;
      bullet.rotation = rotation;
      bullet.damage = damage;
      bullet.speed = speed;

      this.state.bullets.push(bullet);
    });

    this.onMessage("shotSound", (client, message) => {
      this.broadcast("shotSound", message);
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

      zombie.health -= bullet.damage;
      if (zombie.health <= 0) {
        const index = this.state.zombies.findIndex((z) => z.id === zombieId);
        this.state.zombies.splice(index, 1);
        this.waveManager.checkWaveEnd();
        this.spawnCoins(
          zombie.x,
          zombie.y,
          Math.floor((Math.random() * zombie.maxHealth) / 30) + 1
        );
        this.broadcast("blood", {
          x: zombie.x,
          y: zombie.y,
          size: 8,
        });
        this.broadcast("zombieDead", { zombieId });
      }

      this.broadcast("zombieHit", { zombieId, bulletId });

      bullet.piercesLeft--;

      if (bullet.piercesLeft <= 0) {
        const bulletIndex = this.state.bullets.findIndex(
          (b) => b.id === bulletId
        );
        this.state.bullets.splice(bulletIndex, 1);
      }
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

      const damage =
        zombieInfo[zombie.zombieType].baseAttackDamage *
        this.waveManager.currentWave.zombieAttackMultiplier;

      player.health -= damage;
      if (player.health <= 0) {
        this.killPlayer(playerId);
      }
    });

    this.onMessage("spawnZombie", (client, message) => {
      const { x, y, type } = message;
      const zombie = new ZombieState();
      const typeInfo = zombieInfo[type as ZombieType];
      const health = Math.round(
        typeInfo.baseHealth *
          this.waveManager.currentWave.zombieHealthMultiplier
      );
      zombie.id = genId();
      zombie.health = health;
      zombie.maxHealth = health;
      zombie.x = x;
      zombie.y = y;
      zombie.rotation = Math.random() * Math.PI * 2;
      zombie.zombieType = type;
      zombie.playerId = client.sessionId;
      this.state.zombies.push(zombie);
      this.broadcast("spawnZombie", { id: zombie.id });
    });

    this.onMessage("collectCoin", (client, message) => {
      const { id } = message;
      const coinIndex = this.state.coins.findIndex((c) => c.id === id);
      if (coinIndex === -1) return;
      const coin = this.state.coins[coinIndex];

      // give it to all players
      this.state.players.forEach((player) => {
        player.coins += coin.value;
      });

      this.state.coins.splice(coinIndex, 1);
    });

    this.onMessage("buyUpgrade", (client, message) => {
      const { upgradeType, coins } = message;
      const player = this.state.players.get(client.id);
      if (!player) return;
      if (player.coins < coins) return;
      player.coins -= coins;
      const upgrade = player.upgrades;

      switch (upgradeType) {
        case "fireRate":
          upgrade.fireRate++;
          break;
        case "damage":
          upgrade.damage++;
          break;
      }
    });
  }

  killPlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = 0;
    player.healthState = PlayerHealthState.DEAD;
    this.broadcast("playerDied", { playerId });
    this.broadcast("blood", {
      x: player.x,
      y: player.y,
      size: 13,
      amount: 2,
    });
  }

  revivePlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = 100;
    player.healthState = PlayerHealthState.ALIVE;
    this.broadcast("playerRevived", { playerId });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const playerState = new PlayerState();
    playerState.name =
      options.name ?? "Player " + client.sessionId.substr(0, 4);
    playerState.sessionId = client.sessionId;
    playerState.x = Math.floor(Math.random() * 800);
    playerState.y = Math.floor(Math.random() * 600);
    playerState.health = 100;
    playerState.playerClass = options.playerClass ?? "pistol";
    this.state.players.set(client.id, playerState);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.id);

    this.ensureZombieControl();
    this.removeOrphanBullets();
  }

  spawnCoins(x: number, y: number, amount: number) {
    const numCoins = Math.min(amount, 10);
    const coinValue = amount / numCoins;

    const spreadRadius = 10 + Math.sqrt(numCoins) * 10;
    for (let i = 0; i < numCoins; i++) {
      const coin = new CoinState();
      coin.id = genId();
      coin.x = x + Math.random() * spreadRadius * 2 - spreadRadius;
      coin.y = y + Math.random() * spreadRadius * 2 - spreadRadius;
      coin.value = i % 2 === 0 ? Math.floor(coinValue) : Math.ceil(coinValue);
      this.state.coins.push(coin);
    }
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
    client.send("requestSpawnZombie", {
      type: calculateZombieSpawnType(this.waveManager.currentWaveNumber),
    });
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
