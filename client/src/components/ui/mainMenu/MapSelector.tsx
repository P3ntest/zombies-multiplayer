import { MapInfo } from "../../../../../server/src/trpc/mapRouter";
import { trpc } from "../../../lib/trpc/trpcClient";
import { MapPreviewRenderer } from "../../level/LevelInstanceRenderer";
import { CenteredFullScreen } from "../uiUtils";

type onSelect = (mapId: string, mapName: string) => void;

export function MapSelector({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: onSelect;
}) {
  const maps = trpc.maps.getMapsToPlay.useQuery();

  if (!open || !maps.data) return null;

  const _onSelect = (mapId: string, mapName: string) => {
    onSelect(mapId, mapName);
    onClose();
  };

  return (
    <CenteredFullScreen onClose={onClose}>
      <div
        className="bg-slate-800 rounded-xl p-4 z-40"
        style={{
          height: "80vh",
          width: "80vw",
        }}
      >
        <MapsSection
          title="Official Maps"
          maps={maps.data.verifiedMaps as MapInfo[]}
          onSelect={_onSelect}
        />
        {maps.data.myMaps && (
          <MapsSection
            title="My Maps"
            maps={maps.data.myMaps as MapInfo[]}
            onSelect={_onSelect}
          />
        )}
        <MapsSection
          title="Community Maps"
          maps={maps.data.communityMaps as MapInfo[]}
          onSelect={_onSelect}
        />
      </div>
    </CenteredFullScreen>
  );
}

function MapsSection({
  title,
  maps,
  onSelect,
}: {
  title: string;
  maps: MapInfo[];
  onSelect: onSelect;
}) {
  return (
    <div className="bg-opacity-70 p-2 rounded-xl overflow-x-auto">
      <h3 className="text-white font-bold text-2xl mb-3">{title}</h3>
      <div className="flex flex-row gap-2">
        {maps.map((map) => (
          <MapCard key={map.id} info={map} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function MapCard({ info, onSelect }: { info: MapInfo; onSelect: onSelect }) {
  return (
    <div
      className="bg-slate-900 p-4 rounded-xl transition-all hover:scale-105 cursor-pointer h-44 w-96 flex flex-row gap-4"
      onClick={() => {
        onSelect(info.id, info.name);
      }}
    >
      <MapPreviewRenderer level={info.level} size={140} />
      <h4 className="text-white font-bold text-xl max-w-sm text-ellipsis w-60 text-nowrap overflow-hidden">
        {info.name}
      </h4>
    </div>
  );
}
