import { PlayerState } from "../rooms/schema/MyRoomState";

export type PlayerClass = "pistol" | "shotgun" | "rifle" | "melee";

export const PlayerAnimations = {
  NONE: 0,
  RELOAD: 1,
  MELEE: 2,
};

export function calculateScore(player: PlayerState) {
  return (
    player.kills * 100 +
    player.damageDealt +
    player.wavesSurvived * 100 +
    player.accuracy * 100
  );
}
