import { Client, Room } from "@colyseus/core";
import { WaveManager } from "../game/WaveManager";
import { calculateZombieSpawnType } from "../game/waves";
import { ZombieType } from "../game/zombies";
import { MyRoomState, ZombieState } from "./schema/MyRoomState";
import { handleCommand } from "../game/console/commandHandler";
import { getUserForToken } from "../trpc/context";
import { IncomingMessage } from "http";
import { World } from "./World";
import { Player } from "./Player";
import { Vehicle } from "./Vehicle";

export class MyRoom extends Room<MyRoomState> {
  maxClients = 4;

  waveManager = new WaveManager(this);

  waveStartType: "manual" | "playerCount";
  requiredPlayerCount = 1;

  clientToUserMap: Map<string, string | null> = new Map();

  static async onAuth(token: string, req: IncomingMessage) {
    const user = await getUserForToken(token);
    if (user) {
      return user.id;
    } else {
      return true;
    }
  }

  world: World = new World(this);

  update(delta: number) {
    this.world.tick(delta);
  }

  async onCreate(options: any) {
    this.setSimulationInterval((time) => this.update(time), 1000 / 60);

    const roomState = new MyRoomState();
    this.setState(roomState);

    this.onMessage("*", (client, type, message) => {
      this.players.get(client.sessionId)!.onMessage(type, message);
    });

    this.onMessage("chatMessage", (client, message: string) => {
      if (message.startsWith("/")) {
        handleCommand(this, client, message);
        return;
      }
    });

    this.onMessage("shotSound", (client, message) => {
      this.broadcast("shotSound", message);
    });

    new Vehicle(this.world);
  }

  highestZombieId = 0;
  highestBulletId = 0;

  players = new Map<string, Player>();

  onJoin(client: Client, options: any, auth: string | true) {
    console.log(client.sessionId, "joined!");

    const player = new Player(this.world, client);
    this.players.set(client.sessionId, player);
  }

  async onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.players.get(client.sessionId)?.onRemove();
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
    // this.state.bullets = this.state.bullets.filter((bullet) =>
    //   players.has(bullet.playerId)
    // );
  }

  checkGameOver() {
    // for (const player of this.state.players.values()) {
    //   if (player.healthState === PlayerHealthState.ALIVE) {
    //     return;
    //   }
    // }

    this.broadcast("gameOver");
    this.state.isGameOver = true;

    // prisma.playedGame
    //   .create({
    //     data: {
    //       map: {
    //         connect: {
    //           id: this.state.mapId,
    //         },
    //       },
    //       highestWaveSurvived: this.waveManager.currentWaveNumber - 1,
    //       participants: {
    //         create: Array.from(this.state.players.values()).map((p) => ({
    //           username: p.name,
    //           kills: p.kills,
    //           deaths: p.deaths,
    //           accuracy: p.accuracy,
    //           wavesSurvived: p.wavesSurvived,
    //           damageDealt: p.damageDealt,
    //           score: calculateScore(p),
    //           user: {
    //             ...(this.clientToUserMap.get(p.sessionId)
    //               ? {
    //                   connect: {
    //                     id: this.clientToUserMap.get(p.sessionId),
    //                   },
    //                 }
    //               : {}),
    //           },
    //         })),
    //       },
    //     },
    //   })
    //   .catch((e) => {
    //     console.error("Error saving game to database", e);
    //   });
  }

  getConnectedPlayers() {
    return Array.from(this.state.players.values()).filter((p) => p.connected);
  }

  zombieRespawnData: Map<number, ZombieState> = new Map();
  requestSpawnZombie(existing?: ZombieState, zombieType?: ZombieType) {
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

    const type =
      zombieType ??
      calculateZombieSpawnType(this.waveManager.currentWaveNumber);
    console.log("requesting spawn", type);

    client?.send("requestSpawnZombie", {
      type,
      respawnId: existing?.id,
    });
  }
}
