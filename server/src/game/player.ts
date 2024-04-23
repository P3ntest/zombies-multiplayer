import { PlayerState } from "../rooms/schema/MyRoomState";

export type PlayerClass = "pistol" | "shotgun" | "rifle" | "melee";

export function calculateScore(player: PlayerState) {
  return (
    player.kills * 100 +
    player.damageDealt +
    player.wavesSurvived * 100 +
    player.accuracy * 100
  );
}
