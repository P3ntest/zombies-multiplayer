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
    <div className="dropdown px-2">
      <div tabIndex={0} role="button" className="btn btn-primary btn-sm">
        Create
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="1.5em"
          height="1.5em"
          viewBox="0 0 24 24"
        >
          <path
            fill="none"
            stroke="currentColor"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2.5"
            d="m7 10l5 5m0 0l5-5"
          />
        </svg>
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 mt-5 flex flex-col gap-2"
      >
        <li>
          <button
            className="btn btn-sm btn-primary"
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
            className="btn btn-sm btn-primary"
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
    </div>
  );
}
