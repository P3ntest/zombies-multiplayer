import { Client, Room } from "@colyseus/core";
import { WaveManager } from "../game/WaveManager";
import { MapID, maps } from "../game/maps";
import { calculateZombieSpawnType } from "../game/waves";
import { ZombieType, zombieInfo } from "../game/zombies";
import { genId } from "../util";
import {
  BulletState,
  CoinState,
  MyRoomState,
  PlayerHealthState,
  PlayerState,
  ZombieState,
} from "./schema/MyRoomState";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  waveManager = new WaveManager(this);

  waveStartType: "manual" | "playerCount";
  requiredPlayerCount = 1;
  map: MapID = "dust3";

  onCreate(options: any) {
    this.roomId = Math.random().toString(36).substr(2, 5);

    const roomOptions = options.quickPlay
      ? ({
          isPrivate: false,
          maxPlayers: 6,
          waveStartType: "playerCount",
          requiredPlayerCount: 2,
          map: maps[Math.floor(Math.random() * maps.length)],
        } as const)
      : ({
          isPrivate: options.isPrivate,
          maxPlayers: options.maxPlayers,
          waveStartType: options.waveStartType ?? "manual",
          requiredPlayerCount: options.requiredPlayerCount ?? 1,
          map: options.map ?? maps[Math.floor(Math.random() * maps.length)],
        } as const);

    this.maxClients = roomOptions.maxPlayers;
    this.waveStartType = roomOptions.waveStartType;
    this.requiredPlayerCount = roomOptions.requiredPlayerCount;
    this.map = roomOptions.map;

    if (roomOptions.isPrivate) {
      this.setPrivate();
    }

    this.setState(new MyRoomState());
    this.clock.start();

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

    this.onMessage("chatMessage", (client, message) => {
      this.broadcastChat(
        `${this.state.players.get(client.id)?.name}: ${message}`
      );
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
        case "pierce":
          upgrade.pierce++;
          break;
        case "health":
          upgrade.health++;
          player.health = player.health + 20;
          break;
        case "speed":
          upgrade.speed++;
          break;
      }
    });
  }

  killPlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = 0;
    player.healthState = PlayerHealthState.DEAD;
    this.broadcastChat(`${player.name} has died!`, "#ff5555");
    this.broadcast("playerDied", { playerId });
    this.broadcast("blood", {
      x: player.x,
      y: player.y,
      size: 13,
      amount: 2,
    });

    this.checkGameOver();
  }

  revivePlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = 100;
    player.healthState = PlayerHealthState.ALIVE;
    this.broadcast("playerRevived", { playerId });
  }

  broadcastChat(message: string, color?: string) {
    this.broadcast("chatMessage", { message, color });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");
    const playerState = new PlayerState();
    playerState.name =
      options.playerName ?? "Player " + client.sessionId.substr(0, 4);
    playerState.sessionId = client.sessionId;
    playerState.x = Math.floor(Math.random() * 800);
    playerState.y = Math.floor(Math.random() * 600);
    playerState.health = 100;
    playerState.playerClass = options.playerClass ?? "pistol";
    this.state.players.set(client.id, playerState);

    this.broadcastChat(`${playerState.name} has joined the game.`, "#33ff33");

    this.checkCanWaveStart();
  }

  checkCanWaveStart() {
    if (this.waveStartType === "playerCount") {
      if (this.state.players.size >= this.requiredPlayerCount) {
        this.waveManager.beginNextWaveTimeout();
      }
    }
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (consented) {
      this.removePlayerFromGame(client.id);
      this.broadcastChat(
        `${this.state.players.get(client.id)?.name} has left the game.`,
        "#ffff33"
      );
    } else {
      this.state.players.get(client.id)!.connected = false;

      this.broadcastChat(
        `${
          this.state.players.get(client.id)?.name
        } has disconnected. Waiting for reconnection...`,
        "#ffff33"
      );

      this.allowReconnection(client, 20)
        .then(() => {
          this.state.players.get(client.id)!.connected = true;
          this.broadcastChat(
            `${this.state.players.get(client.id)?.name} has reconnected!`,
            "#ffff33"
          );
        })
        .catch(() => {
          this.removePlayerFromGame(client.id);
          this.broadcastChat(
            `${this.state.players.get(client.id)?.name} timed out.`,
            "#ffff33"
          );
        });
    }

    this.ensureZombieControl();
  }

  removePlayerFromGame(id: string) {
    this.state.players.delete(id);
    this.removeOrphanBullets();
  }

  spawnCoins(x: number, y: number, amount: number) {
    // dynamically create combusted coins with 10x the value.
    // ex: 11111 -> 10000 + 1000 + 100 + 10 + 1
    amount = Math.floor(amount);
    let coinValue = amount;
    let coins = [];
    const highestDigit = Math.floor(Math.log10(amount));
    for (let i = highestDigit; i >= 0; i--) {
      const digitValue = Math.pow(10, i);
      while (coinValue >= digitValue) {
        coinValue -= digitValue;
        coins.push(digitValue);
      }
    }

    const spreadRadius = 10 + Math.sqrt(coins.length) * 10;
    for (const value of coins) {
      const coin = new CoinState();
      coin.id = genId();
      coin.x = x + Math.random() * spreadRadius * 2 - spreadRadius;
      coin.y = y + Math.random() * spreadRadius * 2 - spreadRadius;
      coin.value = value;
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

  checkGameOver() {
    for (const player of this.state.players.values()) {
      if (player.healthState === PlayerHealthState.ALIVE) {
        return;
      }
    }

    this.broadcast("gameOver");
    this.state.isGameOver = true;
  }

  getConnectedPlayers() {
    return Array.from(this.state.players.values()).filter((p) => p.connected);
  }

  requestSpawnZombie() {
    if (this.state.isGameOver) return;
    // find a player which has the least number of zombies
    const players = this.getConnectedPlayers();
    if (players.length === 0) return;
    const playerZombieCounts = new Map<string, number>();
    for (const zombie of this.state.zombies) {
      const count = playerZombieCounts.get(zombie.playerId) || 0;
      playerZombieCounts.set(zombie.playerId, count + 1);
    }

    let minCount = Infinity;
    let targetPlayer = null;
    for (const player of players) {
      const count = playerZombieCounts.get(player.sessionId) ?? 0;
      if (count < minCount) {
        minCount = count;
        targetPlayer = player;
      }
    }

    const client = this.clients.find(
      (c) => c.sessionId == targetPlayer?.sessionId
    );
    client?.send("requestSpawnZombie", {
      type: calculateZombieSpawnType(this.waveManager.currentWaveNumber),
    });
  }

  ensureZombieControl() {
    const zombies = this.state.zombies;
    const players = Array.from(this.state.players.values()).filter(
      (p) => p.connected
    );

    for (const zombie of zombies) {
      if (!players.some((p) => p.sessionId === zombie.playerId)) {
        const playerIds = Array.from(players.map((p) => p.sessionId));
        const randomPlayerId =
          playerIds[Math.floor(Math.random() * playerIds.length)];
        zombie.playerId = randomPlayerId;
      }
    }
  }
}
