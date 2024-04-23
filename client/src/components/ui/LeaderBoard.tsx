import { useEffect } from "react";
import { twMerge } from "tailwind-merge";
import { useColyseusState } from "../../colyseus";
import { useUIStore } from "./uiStore";

export function LeaderBoard() {
  const { leaderboardOpen, setLeaderboardOpen } = useUIStore();
  const state = useColyseusState();
  const players = state?.players;

  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setLeaderboardOpen(true);
      }
    };

    const keyup = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        e.preventDefault();
        setLeaderboardOpen(false);
      }
    };

    window.addEventListener("keyup", keyup);
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("keyup", keyup);
    };
  }, [leaderboardOpen, setLeaderboardOpen]);

  return (
    <div
      className={twMerge(
        "flex justify-center items-center mt-28",
        !leaderboardOpen && "hidden"
      )}
    >
      <div className="relative overflow-x-auto sm:rounded-lg w-2/6 select-none">
        <table className="text-sm text-left rtl:text-right text-gray-400 w-full">
          <thead className="text-xs uppercase bg-slate-600 bg-opacity-80">
            <tr>
              <th className="px-6 py-3">Player</th>
              <th className="px-6 py-3">Kills</th>
              <th className="px-6 py-3">Deaths</th>
              <th className="px-6 py-3">Accuracy</th>
              <th className="px-6 py-3">Waves Survived</th>
              <th className="px-6 py-3">Score</th>
            </tr>
          </thead>
          <tbody>
            {players &&
              Array.from(players.values()).map((player, i) => (
                <tr key={i} className="bg-slate-800 bg-opacity-80">
                  <td className="px-6 py-4 uppercase">{player.name}</td>
                  <td className="px-6 py-4">{player.kills}</td>
                  <td className="px-6 py-4">{player.deaths}</td>
                  <td className="px-6 py-4">{player.accuracy}</td>
                  <td className="px-6 py-4">{player.wavesSurvived}</td>
                  <td className="px-6 py-4">{player.score}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
