import { ZombieType } from "./zombies";

export function generateWave(wave: number) {
  wave--; // 0-indexed

  return {
    wave,
    zombies: 20 * 1.45 ** wave,
    zombieSpawnInterval: Math.max(200, 1000 - wave * 50),
    zombieHealthMultiplier: 1.15 ** wave,
    zombieAttackMultiplier: 1.15 ** wave,
    spawnChances: {
      normal: 100,
      baby: Math.min(40, wave * 5),
      greenMutant: Math.min(40, wave * 2),
      tank: Math.min(40, wave * 2),
      blueMutant: Math.min(40, wave * 1),
    },
    postDelay: 5000,
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
