import { SpawnChance, callWaveBasedFunction, waveConfig } from "./config";
import { ZombieType } from "./zombies";

export function generateWave(wave: number, players: number = 1) {
  wave--; // 0-indexed

  return {
    wave,
    zombies: callWaveBasedFunction(waveConfig.zombies, wave),
    zombieSpawnInterval: Math.max(
      waveConfig.zombieSpawnInterval.max,
      waveConfig.zombieSpawnInterval.base +
        waveConfig.zombieSpawnInterval.factor * wave
    ),
    zombieHealthMultiplier: callWaveBasedFunction(
      waveConfig.zombieHealthMultiplier,
      wave * players
    ),
    zombieAttackMultiplier: callWaveBasedFunction(
      waveConfig.zombieAttackMultiplier,
      wave
    ),
    spawnChances: {
      normal: waveConfig.spawnChances.normal,
      baby: calcSpawnChange(wave, "baby"),
      greenMutant: calcSpawnChange(wave, "greenMutant"),
      tank: calcSpawnChange(wave, "tank"),
      blueMutant: calcSpawnChange(wave, "blueMutant"),
    },
    postDelay: waveConfig.postDelay,
  };
}

export function calculateZombieSpawnType(wave: number): ZombieType {
  const spawnChances = generateWave(wave).spawnChances;

  const total = Object.values(spawnChances).reduce((a, b) => a + b, 0);

  let random = Math.random() * total;
  for (const [type, chance] of Object.entries(spawnChances)) {
    random -= chance;
    if (random <= 0) return type as ZombieType;
  }
}

function calcSpawnChange(wave: number, type: ZombieType) {
  const spawnChance = waveConfig.spawnChances[type] as SpawnChance;
  return Math.min(spawnChance.max, wave * spawnChance.factor);
}
