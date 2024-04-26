import { Delayed } from "colyseus";
import { MyRoom } from "../rooms/MyRoom";
import { generateWave } from "./waves";
import { PlayerHealthState } from "../rooms/schema/MyRoomState";
import { getMaxHealth } from "./player";

export class WaveManager {
  constructor(private room: MyRoom) {}

  currentWaveNumber = 0;
  currentWave: ReturnType<typeof generateWave> = generateWave(
    this.currentWaveNumber
  );

  waveRunning = false;

  currentWaveSpawned = 0;

  currentSpawnInterval: Delayed;

  finishedSpawning = false;

  beginNextWave() {
    this.currentWaveNumber++;
    this.room.state.waveInfo.currentWaveNumber = this.currentWaveNumber;
    this.room.state.waveInfo.active = true;
    this.currentWave = generateWave(
      this.currentWaveNumber,
      this.room.state.players.size
    );
    this.waveRunning = true;
    this.currentWaveSpawned = 0;
    this.finishedSpawning = false;

    this.room.broadcast("waveStart", {
      wave: this.currentWaveNumber,
    });

    this.currentSpawnInterval = this.room.clock.setInterval(() => {
      if (this.currentWaveSpawned >= this.currentWave.zombies) {
        this.currentSpawnInterval.clear();
        this.finishedSpawning = true;
        return;
      }
      this.currentWaveSpawned++;
      this.room.requestSpawnZombie();
    }, this.currentWave.zombieSpawnInterval);
  }

  checkWaveEnd() {
    if (this.room.state.zombies.length === 0 && this.finishedSpawning) {
      this.waveEnds();
    }
  }

  waveEnds() {
    this.waveRunning = false;
    this.room.broadcast("waveEnd", {
      wave: this.currentWaveNumber,
    });

    this.room.state.waveInfo.active = false;

    for (const player of this.room.state.players.values()) {
      if (player.healthState === PlayerHealthState.DEAD) {
        this.room.revivePlayer(player.sessionId);
      } else if (player.healthState === PlayerHealthState.NOT_SPAWNED) {
        this.room.spawnPlayer(player.sessionId);
      } else {
        player.health = getMaxHealth(player);
        player.wavesSurvived++;
      }
    }

    this.currentSpawnInterval.clear();

    this.beginNextWaveTimeout();
  }

  nextWaveStarting = false;

  beginNextWaveTimeout() {
    if (this.waveRunning || this.nextWaveStarting) return;
    this.nextWaveStarting = true;

    this.room.clock.setTimeout(() => {
      this.nextWaveStarting = false;
      this.beginNextWave();
    }, this.currentWave.postDelay);
    // interval to update nextWaveInSec
    let totalSeconds = this.currentWave.postDelay / 1000;
    this.room.state.waveInfo.nextWaveStartsInSec = totalSeconds;
    const interval = this.room.clock.setInterval(() => {
      totalSeconds--;
      this.room.state.waveInfo.nextWaveStartsInSec = totalSeconds;
      if (totalSeconds <= 0) {
        interval.clear();
      }
    }, 1000);
  }

  reset() {
    this.currentWaveNumber = 0;
    this.currentWave = generateWave(
      this.currentWaveNumber,
      this.room.state.players.size
    );
    this.waveRunning = false;
    this.currentWaveSpawned = 0;
    this.finishedSpawning = false;
    this.room.state.waveInfo.currentWaveNumber = 0;
    this.room.state.waveInfo.active = false;
    this.currentSpawnInterval?.clear();
  }
}
