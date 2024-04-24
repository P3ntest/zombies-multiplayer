import { PlayerClass } from "../../../../server/src/game/player";
import { useVolumeStore } from "../../components/ui/soundStore";

export function playSound(
  path: string,
  opts?: Partial<{
    volume: number;
  }>,
) {
  const { volume } = useVolumeStore.getState();
  const audio = new Audio(path);
  audio.volume = 0.2 * (opts?.volume ?? 1) * volume;

  audio.play();
}

export function playGunSound(gun: PlayerClass, msCoolDown: number = 1000) {
  switch (gun) {
    case "shotgun":
      playSound("/assets/sounds/guns/shotgun.mp3");
      setTimeout(
        () => {
          playSound("/assets/sounds/guns/shotgun_rack.mp3");
        },
        Math.min(msCoolDown - 800, 500),
      ); // 800ms is the sound length
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
    (_, i) => `/assets/sounds/coins/Coins_Single_${i < 10 ? "0" : ""}${i}.mp3`,
  );
export function playCoinPickup() {
  playSound(coins[Math.floor(Math.random() * coins.length)]);
}

export function playSplat() {
  playSound("/assets/sounds/splat.flac");
}

export function playSelfDied() {
  playSound("/assets/sounds/playerdies.mp3", {
    volume: 2,
  });
}

export function playHurtSound() {
  playSound("/assets/sounds/hurt.flac");
}

export function playMeleeSound(hit: boolean) {
  if (hit) {
    playSound("/assets/sounds/punch.mp3");
  } else {
    playSound("/assets/sounds/punchMiss.mp3");
  }
}
