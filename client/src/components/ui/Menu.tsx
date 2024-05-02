import { CharacterPreview } from "./CharacterPreview";
import { PlayerClass } from "../../../../server/src/game/player";
import { twMerge } from "tailwind-merge";
import { useCharacterCustomizationStore } from "./characterCustomizationStore";
import { JoinMenu } from "./JoinMenu";
import { AuthSection } from "./mainMenu/AuthSection";
import { trpc } from "../../lib/trpc/trpcClient";

export function Menu() {
  return (
    <div
      className="h-screen flex flex-row items-center justify-center gap-4 pt-10"
      style={{
        backgroundImage: "url('/assets/apocalypseWallpaper.png')",
        backgroundSize: "cover",
      }}
    >
      <div className="grid grid-cols-3 p-10 gap-10">
        <Leaderboard />
        <div className="">
          <JoinMenu />
        </div>
        <ClassSelector />
      </div>
    </div>
  );
}

const AVAILABLE_CLASSES: PlayerClass[] = ["pistol", "shotgun", "rifle"];

function ClassSelector() {
  const { selectedClass, setSelectedClass, name, setName } =
    useCharacterCustomizationStore();

  return (
    <div className="flex flex-col items-center gap-4 p-10 card bg-neutral bg-opacity-80">
      <h3 className="text-white font-bold text-2xl">Choose your survivor</h3>

      <CharacterPreview name={name} selectedClass={selectedClass} />
      <div className="flex flex-row gap-3">
        {AVAILABLE_CLASSES.map((playerClass) => {
          return (
            <button
              className={twMerge(
                "btn uppercase",
                selectedClass !== playerClass && "",
                selectedClass === playerClass && "btn-primary"
              )}
              key={playerClass}
              onClick={() => setSelectedClass(playerClass)}
            >
              {playerClass}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value.substring(0, 16))}
        placeholder="Name"
        className="input uppercase"
      />
      <AuthSection />
    </div>
  );
}

function Leaderboard() {
  const { data } = trpc.stats.getLeaderboard.useQuery();

  if (data) console.log(data);

  return (
    <div className="flex flex-col items-center gap-4 p-10 card bg-neutral bg-opacity-80">
      <h3 className="text-white font-bold text-2xl">Leaderboard</h3>
      <div className="overflow-x-auto w-full">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kills</th>
              <th>Deaths</th>
              <th>Score</th>
              <th>Damage</th>
              <th className="tooltip" data-tip="Highest Wave Survived">
                Wave
              </th>
              <th>Accuracy</th>
              <th className="tooltip" data-tip="Number of teammates">
                Team
              </th>
              <th>Map</th>
            </tr>
          </thead>
          <tbody>
            {data
              ? data.leaderboard.map((player) => (
                  <tr key={player.id}>
                    <td className="uppercase">{player.username}</td>
                    <td>{player.kills}</td>
                    <td>{player.deaths}</td>
                    <td>{player.score}</td>
                    <td>{player.damageDealt}</td>
                    <td>{player.waveSurvived}</td>
                    <td>{player.accuracy}</td>
                    <td>{player.playedGame.participants.length}</td>
                    <td>{player.playedGame.map.name}</td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
