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
      <div className="relative overflow-x-auto sm:rounded-lg select-none">
        <table className="text-sm text-left rtl:text-right text-gray-400 w-full">
          <thead className="text-xs uppercase bg-slate-600 bg-opacity-80">
            <tr>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3">Kills</th>
              <th className="px-6 py-3">Deaths</th>
              <th className="px-6 py-3">Accuracy</th>
              <th className="px-6 py-3">Waves Survived</th>
              <th className="px-6 py-3">Damage</th>
              <th className="px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {players &&
              Array.from(players.values())
                .map((player) => ({ ...player, score: calculateScore(player) }))
                .sort((a, b) => b.score - a.score)
                .map((player) => (
                  <tr
                    key={player.sessionId}
                    className="bg-slate-800 bg-opacity-80"
                  >
                    <td className="px-6 py-4 uppercase">{player.name}</td>
                    <td className="px-6 py-4">{player.kills}</td>
                    <td className="px-6 py-4">{player.deaths}</td>
                    <td className="px-6 py-4">{player.accuracy}</td>
                    <td className="px-6 py-4">{player.wavesSurvived}</td>
                    <td className="px-6 py-4">{player.damageDealt}</td>
                    <td className="px-6 py-4">{player.score}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
