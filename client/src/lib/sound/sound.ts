import { PlayerClass } from "../../../../server/src/game/player";

export function playSound(path: string) {
  const audio = new Audio(path);
  audio.volume = 0.2;
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
