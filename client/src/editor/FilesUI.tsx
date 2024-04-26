import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { trpc } from "../lib/trpc/trpcClient";
import { useEditor } from "./mapEditorStore";
import { CenteredFullScreen } from "../components/ui/uiUtils";
import { GameLevel } from "../../../server/src/game/mapEditor/editorTypes";
import { MapPreviewRenderer } from "../components/level/LevelInstanceRenderer";

export function FileOptions() {
  const level = useEditor((state) => state.level);
  const resetLevel = useEditor((state) => state.resetLevel);
  const [confirmReset, setConfirmReset] = useState(false);
  const saveMap = trpc.maps.saveNewMap.useMutation();
  const utils = trpc.useUtils();

  const [openMapOpen, setOpenMapOpen] = useState(false);

  return (
    <div className="mt-2">
      <h2 className="text-white font-bold text-xl mb-1">File Options</h2>
      <div className="flex flex-col gap-2 items-start">
        <div className="flex flex-row items-center gap-2">
          <button
            className="button"
            onClick={async () => {
              const name = prompt("Enter a name for the map");
              await saveMap.mutateAsync({
                name: name ?? "Unnamed Map",
                level: level,
              });
              utils.maps.invalidate();
            }}
          >
            Save as New Map
          </button>
          <button
            className={twMerge(
              "button",
              confirmReset && "bg-red-500 hover:bg-red-700"
            )}
            onClick={() => {
              if (confirmReset) {
                resetLevel();
                setConfirmReset(false);
              } else {
                setConfirmReset(true);
                setTimeout(() => {
                  setConfirmReset(false);
                }, 1500);
              }
            }}
          >
            {confirmReset ? "Confirm?" : "Reset Editor"}
          </button>
        </div>

        <button className="button" onClick={() => setOpenMapOpen(true)}>
          My Maps
        </button>
      </div>

      <MyMaps open={openMapOpen} setOpen={setOpenMapOpen} />
    </div>
  );
}

function MyMaps({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const myMaps = trpc.maps.myMaps.useQuery();

  if (!open) {
    return null;
  }

  return (
    <CenteredFullScreen onClose={() => setOpen(false)}>
      <div className="bg-slate-900 rounded-xl p-4">
        <h2 className="text-white font-bold text-xl mb-4">My Maps</h2>
        <div className="grid grid-cols-2 gap-2">
          {myMaps.data?.map((map) => (
            <MapCard key={map.id} id={map.id} />
          ))}
        </div>
      </div>
    </CenteredFullScreen>
  );
}

function MapCard({ id }: { id: string }) {
  const map = trpc.maps.myMapOne.useQuery(id);
  const loadLevel = useEditor((state) => state.loadLevel);
  const level = useEditor((state) => state.level);
  const togglePublish = trpc.maps.setPublishMap.useMutation();
  const overwriteMap = trpc.maps.overwriteMap.useMutation();
  const deleteMap = trpc.maps.deleteMap.useMutation();
  const utils = trpc.useUtils();

  if (!map.data) return;

  return (
    <div className="bg-slate-600 p-4 rounded-xl">
      <h3 className="text-white font-bold text-xl mb-1">{map.data.name}</h3>
      <div className="rounded-xl overflow-hidden my-4">
        <MapPreviewRenderer level={map.data.level as GameLevel} size={250} />
      </div>
      <div className="flex flex-row gap-2">
        <ConfirmButton
          onClick={() => {
            loadLevel(map.data.level);
          }}
        >
          Load
        </ConfirmButton>
        <ConfirmButton
          onClick={async () => {
            await overwriteMap.mutateAsync({
              mapId: map.data.id,
              level: level,
            });
            utils.maps.invalidate();
          }}
        >
          Overwrite
        </ConfirmButton>
        <ConfirmButton
          onClick={() => {
            deleteMap.mutateAsync(map.data.id);
            utils.maps.invalidate();
          }}
        >
          Delete
        </ConfirmButton>
        <button
          className="button"
          onClick={async () => {
            await togglePublish.mutateAsync({
              mapId: map.data.id,
              publish: !map.data.published,
            });
            utils.maps.invalidate();
          }}
        >
          {map.data.published ? "Unpublish" : "Publish"}
        </button>
      </div>
    </div>
  );
}

function ConfirmButton({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  return (
    <button
      className={twMerge("button", confirm && "bg-red-500 hover:bg-red-700")}
      onClick={() => {
        if (confirm) {
          onClick();
          setConfirm(false);
        } else {
          setConfirm(true);
          setTimeout(() => {
            setConfirm(false);
          }, 1500);
        }
      }}
    >
      {confirm ? "Confirm?" : children}
    </button>
  );
}
