import { Assets } from "pixi.js";
import { PlayerClass } from "../../../../server/src/game/player";
import { useClientSettings } from "../../components/ui/soundStore";
import { Sound } from "@pixi/sound";

export function playSound(
  path: string,
  opts?: Partial<{
    volume: number;
  }>
) {
  const { volume } = useClientSettings.getState();
  Assets.load(path).then((s: Sound | null) => {
    if (!s) throw new Error("Sound not found " + path);

    s.volume = (opts?.volume ?? 1) * volume * 0.2;
    s.play();
  });
  // const audio = new Audio(path);
  // audio.volume = 0.2 * (opts?.volume ?? 1) * volume;

  // audio.play();
}

export function playGunSound(gun: PlayerClass, msCoolDown: number = 1000) {
  switch (gun) {
    case "shotgun":
      playSound("/assets/sounds/guns/shotgun.mp3");
      setTimeout(() => {
        playSound("/assets/sounds/guns/shotgun_rack.mp3");
      }, Math.min(msCoolDown - 800, 500)); // 800ms is the sound length
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
  playSound("/assets/sounds/impact.ogg", {
    volume: 0.5,
  });
}

export function playZombieDead() {
  playSound("/assets/sounds/zombieDeath.wav");
}

export function playWaveStart() {
  playSound("/assets/sounds/waveStart.wav");
}

const growls = new Array(16)
  .fill(0)
  .map((_, i) => `/assets/sounds/growls/monster/monster.${i + 1}.ogg`);

export function playZombieGrowl(volume: number = 1) {
  playSound(growls[Math.floor(Math.random() * growls.length)], {
    volume: 0.5 * volume,
  });
}

export function playSplat() {
  playSound("/assets/sounds/splat.ogg");
}

export function playSelfDied() {
  playSound("/assets/sounds/playerdies.mp3", {
    volume: 2,
  });
}

export function playHurtSound() {
  playSound("/assets/sounds/hurt.ogg");
}

export function playMeleeSound(hit: boolean) {
  if (hit) {
    playSound("/assets/sounds/punch.mp3");
  } else {
    playSound("/assets/sounds/punchMiss.mp3");
  }
}
