import { MapObject } from "../../../server/src/game/mapEditor/editorTypes";
import { useEditor } from "./mapEditorStore";

export function CreateAssetsMenu() {
  const addObject = useEditor((state) => state.addObject);
  const setSelectedObject = useEditor((state) => state.setSelectedObject);

  const x = useEditor((state) => state.cameraX);
  const y = useEditor((state) => state.cameraY);

  const create = (obj: MapObject) => {
    addObject(obj);
    setSelectedObject(obj.id);
  };

  return (
    <li>
      <details>
        <summary>Create</summary>
        <ul className="flex flex-col gap-2">
          <li>
            <button
              className="button"
              onClick={() =>
                create({
                  objectType: "asset",
                  x,
                  y,
                  width: 100,
                  height: 100,
                  colliders: [],
                  rotation: 0,
                  zHeight: 100,
                  id: Math.random().toString(36).substr(2, 5),
                  scale: 1,
                  tiling: false,
                  sprite: {
                    assetSource: "custom",
                    uploadId: "",
                  },
                })
              }
            >
              Asset
            </button>
          </li>
          <li>
            <button
              className="button"
              onClick={() => {
                create({
                  objectType: "spawnPoint",
                  x,
                  y,
                  rotation: 0,
                  id: Math.random().toString(36).substr(2, 5),
                  scale: 1,
                  spawns: "player",
                });
              }}
            >
              Spawn Point
            </button>
          </li>
        </ul>
      </details>
    </li>
  );

  return (
    <div className="h-full">
      <div className="card bg-neutral p-4 rounded-xl pointer-events-auto flex flex-col gap-4">
        <div>
          <h1 className="text-white font-bold text-xl mb-3">Create</h1>
          <div className="flex flex-row gap-2"></div>
          <button
            className="button"
            onClick={() =>
              create({
                objectType: "asset",
                x,
                y,
                width: 100,
                height: 100,
                colliders: [],
                rotation: 0,
                zHeight: 100,
                id: Math.random().toString(36).substr(2, 5),
                scale: 1,
                tiling: false,
                sprite: {
                  assetSource: "custom",
                  uploadId: "",
                },
              })
            }
          >
            Asset
          </button>
          <button
            className="button"
            onClick={() => {
              create({
                objectType: "spawnPoint",
                x,
                y,
                rotation: 0,
                id: Math.random().toString(36).substr(2, 5),
                scale: 1,
                spawns: "player",
              });
            }}
          >
            Spawn Point
          </button>
        </div>
      </div>
    </div>
  );
}
