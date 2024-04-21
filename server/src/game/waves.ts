import { ZombieType } from "./zombies";

export function generateWave(wave: number) {
  wave--; // 0-indexed

  return {
    wave,
    zombies: 10 + wave * 3,
    zombieSpawnInterval: Math.max(200, 1000 - wave * 50),
    zombieHealthMultiplier: 1 + wave * 0.1,
    zombieAttackMultiplier: 1 + wave * 0.1,
    spawnChances: {
      normal: 100,
      baby: Math.min(100, wave * 10),
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
