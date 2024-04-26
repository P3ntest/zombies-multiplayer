import { SpawnChance, calcUpgrade, waveConfig } from "./config";
import { ZombieType } from "./zombies";

export function generateWave(wave: number, players: number = 1) {
  wave--; // 0-indexed

  return {
    wave,
    zombies: calcUpgrade(waveConfig.zombies, wave),
    zombieSpawnInterval: Math.max(
      waveConfig.zombieSpawnInterval.max,
      waveConfig.zombieSpawnInterval.base +
        waveConfig.zombieSpawnInterval.factor * wave
    ),
    zombieHealthMultiplier: calcUpgrade(
      waveConfig.zombieHealthMultiplier,
      wave * players
    ),
    zombieAttackMultiplier: calcUpgrade(
      waveConfig.zombieAttackMultiplier,
      wave
    ),
    spawnChances: {
      normal: waveConfig.spawnChances.normal,
      baby: caclSpawnChance(wave, "baby"),
      greenMutant: caclSpawnChance(wave, "greenMutant"),
      tank: caclSpawnChance(wave, "tank"),
      blueMutant: caclSpawnChance(wave, "blueMutant"),
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

function caclSpawnChance(wave: number, type: ZombieType) {
  const spawnChance = waveConfig.spawnChances[type] as SpawnChance;
  return Math.min(spawnChance.min, wave * spawnChance.factor);
}
