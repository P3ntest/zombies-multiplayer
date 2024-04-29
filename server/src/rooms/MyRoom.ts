import { Client, Room } from "@colyseus/core";
import { WaveManager } from "../game/WaveManager";
import { calculateZombieSpawnType } from "../game/waves";
import { ZombieType, zombieInfo } from "../game/zombies";
import {
  BulletState,
  MyRoomState,
  PlayerHealthState,
  PlayerState,
  ZombieState,
} from "./schema/MyRoomState";
import { handleCommand } from "../game/console/commandHandler";
import { calcUpgrade, playerConfig } from "../game/config";
import { calculateScore, getMaxHealth } from "../game/player";
import { prisma } from "../prisma";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  waveManager = new WaveManager(this);

  waveStartType: "manual" | "playerCount";
  requiredPlayerCount = 1;

  async onCreate(options: any) {
    this.roomId = Math.random().toString(36).substr(2, 5);

    const roomOptions = options.quickPlay
      ? ({
          isPrivate: false,
          maxPlayers: 6,
          waveStartType: "playerCount",
          requiredPlayerCount: 2,
          mapId: null,
        } as const)
      : ({
          isPrivate: options.isPrivate,
          maxPlayers: options.maxPlayers,
          waveStartType: options.waveStartType ?? "manual",
          requiredPlayerCount: options.requiredPlayerCount ?? 1,
          mapId: options.mapId,
        } as const);

    this.maxClients = roomOptions.maxPlayers;
    this.waveStartType = roomOptions.waveStartType;
    this.requiredPlayerCount = roomOptions.requiredPlayerCount;

    const roomState = new MyRoomState();

    if (roomOptions.mapId) {
      roomState.mapId = roomOptions.mapId;
    } else {
      const amountVerifiedMaps = await prisma.map.count({
        where: { verified: true },
      });
      const selectedMap = await prisma.map.findFirst({
        where: {
          verified: true,
        },
        skip: Math.floor(Math.random() * amountVerifiedMaps),
      });
      if (!selectedMap) {
        throw new Error("No verified maps found.");
      }
      roomState.mapId = selectedMap.id;
    }

    if (roomOptions.isPrivate) {
      this.setPrivate();
    }

    this.setState(roomState);
    this.clock.start();

    this.clock.setInterval(() => {
      this.state.gameTick++;
      this.broadcast("gameTick", this.state.gameTick);
    }, 1000 / 20);

    this.onMessage("move", (client, message) => {
      const player = this.state.players.get(client.id);
      const { x, y, rotation, velocityX, velocityY, currentAnimation } =
        message;
      player.x = x;
      player.y = y;
      player.velocityX = velocityX;
      player.velocityY = velocityY;
      player.rotation = rotation;

      currentAnimation != undefined &&
        (player.currentAnimation = currentAnimation);
    });

    this.onMessage("chatMessage", (client, message: string) => {
      if (message.startsWith("/")) {
        handleCommand(this, client, message);
        return;
      }
      this.broadcastChat(
        `${this.state.players.get(client.id)?.name}: ${message}`
      );
    });

    this.onMessage("finishedLoading", (client, message) => {
      const player = this.state.players.get(client.id)!;
      player.finishedLoading = true;

      //TEMP: for testing
      // this.requestSpawnZombie();

      this.checkCanWaveStart();
      this.ensureZombieControl();

      if (player.healthState === PlayerHealthState.NOT_SPAWNED) {
        if (!this.waveManager.waveRunning) this.spawnPlayer(client.id);
        else
          this.sendChatToPlayer(
            client.id,
            "Wave is running, please wait for the next wave to spawn.",
            "#aa55cc"
          );
      }
    });

    this.onMessage("shoot", (client, message) => {
      const { originX, originY, rotation, speed, damage, pierces, knockBack } =
        message;

      const bullet = new BulletState();
      bullet.id = this.highestBulletId++;
      bullet.playerId = client.sessionId;
      bullet.originX = originX;
      bullet.piercesLeft = pierces;
      bullet.originY = originY;
      bullet.rotation = rotation;
      bullet.damage = damage;
      bullet.speed = speed;
      bullet.knockBack = knockBack ?? 1;

      this.state.bullets.push(bullet);
    });

    this.onMessage("shotSound", (client, message) => {
      this.broadcast("shotSound", message);
    });

    this.onMessage("destroyBullet", (client, message) => {
      this.state.bullets = this.state.bullets.filter((b) => b.id !== message);
    });

    this.onMessage("updateZombie", (client, message) => {
      this.updateZombie(message);
    });
    this.onMessage("updateZombieBatch", (client, message) => {
      for (const update of message) {
        this.updateZombie(update);
      }
    });

    this.onMessage("zombieDespawn", (client, message) => {
      const zombie = this.state.zombies.find((z) => z.id === message.zombieId);
      if (!zombie) return;
      this.requestSpawnZombie(zombie);
      this.state.zombies = this.state.zombies.filter((z) => z.id !== zombie.id);
      this.broadcastChat(
        `A Zombie has been teleported back to a spawn point due to being stuck.`,
        "#cccccc"
      );
    });

    this.onMessage("meleeHitZombie", (client, message) => {
      const { zombieId, damage, knockBack } = message;
      const zombie = this.state.zombies.find((z) => z.id === zombieId);
      if (!zombie) return;

      this.state.players.get(client.id)!.damageDealt += damage;
      zombie.health -= damage;
      if (zombie.health <= 0) {
        this.killZombie(zombieId, client.id);
        return;
      }

      const angle = Math.atan2(
        zombie.y - this.state.players.get(client.id)!.y,
        zombie.x - this.state.players.get(client.id)!.x
      );

      this.broadcast("zombieHit", { zombieId, damage, knockBack, angle });
    });

    this.onMessage("zombieHit", (client, message) => {
      const { zombieId, bulletId } = message;
      const zombie = this.state.zombies.find((z) => z.id === zombieId);
      if (!zombie) return;

      const bullet = this.state.bullets.find((b) => b.id === bulletId);
      if (!bullet) return;

      bullet.piercesLeft--;

      if (bullet.piercesLeft <= 0) {
        const bulletIndex = this.state.bullets.findIndex(
          (b) => b.id === bulletId
        );
        this.state.bullets.splice(bulletIndex, 1);
      }

      this.state.players.get(client.id)!.damageDealt += bullet.damage;
      zombie.health -= bullet.damage;
      if (zombie.health <= 0) {
        this.killZombie(zombieId, client.id);
        return;
      }

      const angle = Math.atan2(
        zombie.y - bullet.originY,
        zombie.x - bullet.originX
      );

      this.broadcast("zombieHit", {
        zombieId,
        bulletId,
        angle,
        knockBack: bullet.knockBack,
      });
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
      this.broadcast("playerHurt", { playerId });

      const damage =
        zombieInfo[zombie.zombieType].baseAttackDamage *
        this.waveManager.currentWave.zombieAttackMultiplier;

      player.health -= damage;
      if (player.health <= 0) {
        this.killPlayer(playerId);
      }
    });

    this.onMessage("spawnZombie", (client, message) => {
      const { x, y, type, respawnId } = message;

      if (respawnId) {
        const zombie = this.zombieRespawnData.get(respawnId);
        if (zombie) {
          console.log("respawning zombie", zombie.id);
          zombie.x = x;
          zombie.y = y;
          zombie.id = this.highestZombieId++;
          this.state.zombies.push(zombie);
          return;
        }
      }

      const zombie = new ZombieState();
      const typeInfo = zombieInfo[type as ZombieType];
      const health = Math.round(
        typeInfo.baseHealth *
          this.waveManager.currentWave.zombieHealthMultiplier
      );
      zombie.id = this.highestZombieId++;
      zombie.health = health;
      zombie.maxHealth = health;
      zombie.x = x;
      zombie.y = y;
      zombie.rotation = Math.random() * Math.PI * 2;
      zombie.zombieType = type;
      zombie.playerId = client.sessionId;
      this.state.zombies.push(zombie);
    });

    this.onMessage("buyUpgrade", (client, message) => {
      const { upgradeType, skillPoints } = message;
      const player = this.state.players.get(client.id);
      if (!player) return;
      if (player.skillPoints < skillPoints) return;
      player.skillPoints -= skillPoints;
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
          player.health += calcUpgrade(
            playerConfig.healthUpgrade,
            player.upgrades.health,
            0
          );
          break;
        case "speed":
          upgrade.speed++;
          break;
        case "scope":
          upgrade.scope++;
          break;
      }
    });

    this.onMessage("spawnSelf", (client, message) => {
      const player = this.state.players.get(client.id);
      if (!player) return;

      player.x = message.x;
      player.y = message.y;
      player.healthState = PlayerHealthState.ALIVE;
      player.rotation = message.rotation ?? 0;
    });
  }

  highestZombieId = 0;
  highestBulletId = 0;

  updateZombie(message: any) {
    const { id, x, y, rotation, targetPlayerId } = message;
    const zombie = this.state.zombies.find((z) => z.id === id);
    if (!zombie) return;

    x && (zombie.x = x);
    y && (zombie.y = y);
    rotation && (zombie.rotation = rotation);
    targetPlayerId != undefined && (zombie.targetPlayerId = targetPlayerId);
  }

  killPlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = 0;
    player.healthState = PlayerHealthState.DEAD;
    player.deaths++;
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

  killZombie(zombieId: number, playerI?: string) {
    if (playerI) {
      const player = this.state.players.get(playerI);
      if (player) {
        player.kills++;
      }
    }

    const zombie = this.state.zombies.find((z) => z.id === zombieId);
    this.state.zombies = this.state.zombies.filter((z) => z.id !== zombieId);
    this.waveManager.checkWaveEnd();
    this.broadcast("blood", {
      x: zombie.x,
      y: zombie.y,
      size: 8,
    });
    this.broadcast("zombieDead", { zombieId });
  }

  revivePlayer(playerId: string) {
    const player = this.state.players.get(playerId);
    if (!player) return;

    player.health = getMaxHealth(player);
    player.healthState = PlayerHealthState.ALIVE;
    this.broadcast("playerRevived", { playerId });
  }

  broadcastChat(message: string, color?: string) {
    this.broadcast("chatMessage", { message, color });
  }

  sendChatToPlayer(playerId: string, message: string, color?: string) {
    const client = this.clients.find((c) => c.sessionId === playerId);
    client?.send("chatMessage", { message, color });
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
  }

  spawnPlayer(clientId: string) {
    console.log("spawning player", clientId);
    const client = this.clients.find((c) => c.id === clientId);
    client.send("requestSpawn");
  }

  checkCanWaveStart() {
    console.log("checking can wave start");
    if (
      this.waveManager.waveRunning ||
      this.waveManager.nextWaveStarting ||
      this.state.isGameOver
    )
      return;
    console.log("can wave start1");
    if (this.waveStartType === "playerCount") {
      console.log(
        "can wave start2",
        this.state.players.size,
        this.requiredPlayerCount
      );
      if (this.state.players.size >= this.requiredPlayerCount) {
        this.waveManager.beginNextWaveTimeout();
      }
    }
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    if (consented) {
      this.broadcastChat(
        `${this.state.players.get(client.id)?.name} has left the game.`,
        "#ffff33"
      );
      this.removePlayerFromGame(client.id);
      console.log(client.sessionId, "consented and left!");
    } else {
      const player = this.state.players.get(client.id)!;
      player.connected = false;
      player.finishedLoading = false;

      this.broadcastChat(
        `${
          this.state.players.get(client.id)?.name
        } has disconnected. Waiting for reconnection...`,
        "#ffff33"
      );

      console.log(client.sessionId, "left without consent!");

      this.allowReconnection(client, 20)
        .then(() => {
          this.state.players.get(client.id)!.connected = true;
          this.broadcastChat(
            `${this.state.players.get(client.id)?.name} has reconnected!`,
            "#ffff33"
          );
          console.log(client.sessionId, "reconnected!");
        })
        .catch(() => {
          this.broadcastChat(
            `${this.state.players.get(client.id)?.name} timed out.`,
            "#ffff33"
          );
          console.log(client.sessionId, "timed out!");
          this.removePlayerFromGame(client.id);
        });
    }

    this.ensureZombieControl();
  }

  removePlayerFromGame(id: string) {
    this.state.players.delete(id);
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

  checkGameOver() {
    for (const player of this.state.players.values()) {
      if (player.healthState === PlayerHealthState.ALIVE) {
        return;
      }
    }

    this.broadcast("gameOver");
    this.state.isGameOver = true;

    prisma.playedGame
      .create({
        data: {
          map: {
            connect: {
              id: this.state.mapId,
            },
          },
          wavesSurvived: this.waveManager.currentWaveNumber - 1,
          participants: {
            create: Array.from(this.state.players.values()).map((p) => ({
              username: p.name,
              kills: p.kills,
              deaths: p.deaths,
              accuracy: p.accuracy,
              waveSurvived: p.wavesSurvived,
              damageDealt: p.damageDealt,
              score: calculateScore(p),
            })),
          },
        },
      })
      .catch((e) => {
        console.error("Error saving game to database", e);
      });
  }

  getConnectedPlayers() {
    return Array.from(this.state.players.values()).filter((p) => p.connected);
  }

  zombieRespawnData: Map<number, ZombieState> = new Map();
  requestSpawnZombie(existing?: ZombieState) {
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
    if (existing) {
      this.zombieRespawnData.set(existing.id, existing.clone());
    }
    client?.send("requestSpawnZombie", {
      type: calculateZombieSpawnType(this.waveManager.currentWaveNumber),
      respawnId: existing?.id,
    });
  }

  ensureZombieControl() {
    const zombies = this.state.zombies;
    const players = Array.from(this.state.players.values()).filter(
      (p) => p.connected && p.finishedLoading
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
