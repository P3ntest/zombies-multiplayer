import { Delayed } from "colyseus";
import { MyRoom } from "../rooms/MyRoom";
import { generateWave } from "./waves";

const WAVE_PAUSE_MS = 5 * 1000;

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
    this.currentWave = generateWave(this.currentWaveNumber);
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

    this.currentSpawnInterval.clear();

    this.beginNextWaveTimeout();
  }

  beginNextWaveTimeout() {
    this.room.clock.setTimeout(() => {
      this.beginNextWave();
    }, this.currentWave.postDelay);
  }

  init() {
    this.beginNextWaveTimeout();
  }
}
