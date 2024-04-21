import { PlayerClass } from "../../../../server/src/game/player";

export function playSound(
  path: string,
  opts?: Partial<{
    volume: number;
  }>
) {
  const audio = new Audio(path);
  audio.volume = 0.2 * (opts?.volume ?? 1);

  audio.play();
}

export function playGunSound(gun: PlayerClass) {
  switch (gun) {
    case "shotgun":
      playSound("/assets/sounds/guns/shotgun.mp3");
      setTimeout(() => {
        playSound("/assets/sounds/guns/shotgun_rack.mp3");
      }, 500);
      break;
    case "rifle":
      playSound("/assets/sounds/guns/rifle.mp3");
      break;
    case "pistol":
    default:
      playSound("/assets/sounds/guns/9mm.mp3");
      break;
  }
}

export function playZombieHitSound() {
  playSound("/assets/sounds/impact.flac", {
    volume: 0.5,
  });
}

export function playZombieDead() {
  playSound("/assets/sounds/zombieDeath.wav");
}

export function playWaveStart() {
  playSound("/assets/sounds/waveStart.wav");
}

const growls = new Array(17)
  .fill(0)
  .map((_, i) => `/assets/sounds/growls/monster/monster.${i + 1}.ogg`);

export function playZombieGrowl(volume: number = 1) {
  playSound(growls[Math.floor(Math.random() * growls.length)], {
    volume: 0.5 * volume,
  });
}

const coins = new Array(55)
  .fill(0)
  .map(
    (_, i) => `/assets/sounds/coins/Coins_Single_${i < 10 ? "0" : ""}${i}.mp3`
  );
export function playCoinPickup() {
  playSound(coins[Math.floor(Math.random() * coins.length)]);
}
