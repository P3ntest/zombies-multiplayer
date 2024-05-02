import { twMerge } from "tailwind-merge";
import { calculateScore } from "../../../../server/src/game/player";
import { useColyseusState } from "../../colyseus";
import { useUIStore } from "./uiStore";
import { useIsKeyDown } from "../../lib/useControls";
import { useEffect } from "react";

export function LeaderBoard({ gameOver }: { gameOver: boolean }) {
  const { leaderboardOpen, setLeaderboardOpen } = useUIStore();
  const state = useColyseusState();
  const players = state?.players;
  const keyDown = useIsKeyDown("tab");
  useEffect(() => {
    setLeaderboardOpen(keyDown || gameOver);
  }, [gameOver, keyDown, setLeaderboardOpen]);

  return (
    <div
      className={twMerge(
        "flex justify-center items-center mt-28",
        !leaderboardOpen && "hidden"
      )}
    >
      <div className="flex flex-col items-center card bg-neutral bg-opacity-80">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kills</th>
              <th>Deaths</th>
              <th>Accuracy</th>
              <th>Waves Survived</th>
              <th>Damage</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {players &&
              Array.from(players.values())
                .map((player) => ({
                  ...player,
                  score: calculateScore(player),
                }))
                .sort((a, b) => b.score - a.score)
                .map((player) => (
                  <tr key={player.sessionId}>
                    <td className="uppercase">{player.name}</td>
                    <td>{player.kills}</td>
                    <td>{player.deaths}</td>
                    <td>{player.accuracy}</td>
                    <td>{player.wavesSurvived}</td>
                    <td>{player.damageDealt}</td>
                    <td>{player.score}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
