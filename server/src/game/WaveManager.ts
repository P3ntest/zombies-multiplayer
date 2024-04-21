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

  beginNextWave() {
    this.currentWaveNumber++;
    this.currentWave = generateWave(this.currentWaveNumber);
    this.waveRunning = true;

    this.room.broadcast("wave", {
      wave: this.currentWaveNumber,
      zombies: this.currentWave.zombies,
    });

    this.room.clock.setTimeout(() => {
      this.waveRunning = false;
      this.beginNextWave();
    }, this.currentWave.zombies * this.currentWave.zombieSpawnInterval);

    this.room.clock.setTimeout(() => {
      this.beginNextWave();
    }, this.currentWave.postDelay);
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
