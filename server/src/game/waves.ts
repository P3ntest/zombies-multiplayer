export function generateWave(wave: number) {
  return {
    wave,
    zombies: 10 + wave * 3,
    zombieSpawnInterval: Math.max(200, 1000 - wave * 50),
    zombieHealth: 100 + wave * 10,
    zombieAttackDamage: 10 + wave * 2,
    postDelay: 5000,
  };
}
