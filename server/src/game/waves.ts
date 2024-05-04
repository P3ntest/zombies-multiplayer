import { SpawnChance, callWaveBasedFunction, waveConfig } from "./config";
import { ZombieType } from "./zombies";

export function generateWave(wave: number, players: number = 1) {
  wave--; // 0-indexed

  return {
    wave,
    zombies: Math.round(callWaveBasedFunction(waveConfig.zombies, wave)),
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
      normal: calcSpawnChange(wave, "normal"),
      baby: calcSpawnChange(wave, "baby"),
      mutatedBaby: calcSpawnChange(wave, "mutatedBaby"),
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
  return minmax(wave * spawnChance.factor, spawnChance.base, spawnChance.max);
}

// for (let wave = 0; wave < 20; wave++) {
//   console.log(`============ Wave ${wave + 1} ============`);
//   // log how what types of zombies spawn
//   const numZombies = generateWave(wave).zombies;
//   const zombieSpawns: Record<ZombieType, number> = {
//     normal: 0,
//     baby: 0,
//     mutatedBaby: 0,
//     greenMutant: 0,
//     tank: 0,
//     blueMutant: 0,
//   };
//   for (let i = 0; i < numZombies; i++) {
//     zombieSpawns[calculateZombieSpawnType(wave)]++;
//   }
//   console.log(zombieSpawns);
// }

function minmax(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}
