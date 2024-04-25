/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor } from "./mapEditorStore";
import "./editor.css";
import {
  AssetSource,
  MapObject,
} from "../../../server/src/game/mapEditor/editorTypes";
import { twMerge } from "tailwind-merge";
export function MapEditorUI() {
  return (
    <div
      style={{
        pointerEvents: "none",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
      }}
    >
      <Inspector />
      <CreatePanel />
    </div>
  );
}

function CreatePanel() {
  const addObject = useEditor((state) => state.addObject);
  const setSelectedObject = useEditor((state) => state.setSelectedObject);

  const x = useEditor((state) => state.cameraX);
  const y = useEditor((state) => state.cameraY);

  const create = (obj: MapObject) => {
    addObject(obj);
    setSelectedObject(obj.id);
  };

  return (
    <div className="absolute top-0 left-0 p-5 w-96">
      <div className="bg-slate-900 p-4 rounded-xl pointer-events-auto">
        <h1 className="text-white font-bold text-xl mb-3">Create</h1>
        <div className="flex flex-row gap-2">
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
                id: Math.random().toString(36).substr(2, 5),
                scale: 1,
                tiling: false,
                sprite: {
                  assetSource: "external",
                  assetUrl: "/assets/editor/missing.png",
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

function Inspector() {
  const selectedObject = useEditor((state) =>
    state.level.objects.find((o) => o.id === state.selectedObject)
  );
  const updateObject = useEditor((state) => state.updateObject);
  const deleteObject = useEditor((state) => state.deleteObject);

  if (!selectedObject) return null;

  console.log(selectedObject);

  const field = ({
    key,
    label,
    type = "text",
    step,
  }: {
    key: string;
    label?: string;
    type?: "number" | "text";
    step?: number;
  }) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (selectedObject as any)[key];
    const displayValue = typeof value === "number" ? value : value;
    return (
      <div>
        {label && <label className="text-white">{label}</label>}
        <input
          type={type}
          step={step}
          value={displayValue}
          className="input"
          onChange={(e) =>
            updateObject(selectedObject.id, { [key]: e.target.value })
          }
        />
      </div>
    );
  };

  return (
    <div className="absolute top-0 right-0 p-5 w-96">
      <div className="bg-slate-900 p-4 rounded-xl pointer-events-auto">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-white font-bold text-xl mb-3">Inspector</h1>
          <button
            className="button button-red"
            onClick={() => deleteObject(selectedObject.id)}
          >
            Delete
          </button>
        </div>
        <h2 className="text-white font-bold text-lg mb-1">Position</h2>
        <div className="flex flex-row gap-2">
          {field({
            key: "x",
            type: "number",
          })}
          {field({
            key: "y",
            type: "number",
          })}
        </div>
        <div className="flex flex-row gap-2">
          <div>
            <h2 className="text-white font-bold text-lg mb-1">Rotation</h2>

            <input
              type="text"
              className="input"
              value={Math.floor(selectedObject.rotation * (180 / Math.PI))}
              onChange={(e) => {
                const value = Math.floor(parseFloat(e.target.value)) || 0;
                updateObject(selectedObject.id, {
                  rotation: value * (Math.PI / 180),
                });
              }}
            />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg mb-1">Scale</h2>

            {field({
              key: "scale",
              type: "number",
              step: 0.1,
            })}
          </div>
        </div>
        {selectedObject.objectType === "asset" && (
          <div>
            <h2 className="text-white font-bold text-lg mb-1">Tiling</h2>
            <input
              type="checkbox"
              checked={selectedObject.tiling}
              onChange={(e) =>
                updateObject(selectedObject.id, {
                  tiling: e.target.checked,
                })
              }
            />
            {selectedObject.tiling && (
              <div className="flex flex-row items-center gap-2">
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Width</h2>
                  <input
                    type="number"
                    value={selectedObject.width}
                    className="input"
                    onChange={(e) => {
                      updateObject(selectedObject.id, {
                        width: parseInt(e.target.value),
                      } as any);
                    }}
                  />
                </div>
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Height</h2>
                  <input
                    type="number"
                    value={selectedObject.height}
                    className="input"
                    onChange={(e) => {
                      updateObject(selectedObject.id, {
                        height: parseInt(e.target.value),
                      } as any);
                    }}
                  />
                </div>
              </div>
            )}
            <h2 className="text-white font-bold text-lg mb-1">Sprite Source</h2>
            <SourceEditor
              source={selectedObject.sprite}
              setSource={(source) =>
                updateObject(selectedObject.id, { sprite: source })
              }
            />
          </div>
        )}
        {selectedObject.objectType === "spawnPoint" && (
          <div>
            <h2 className="text-white font-bold text-lg mb-1">Spawns</h2>
            <div className="flex flex-row items-center gap-2">
              <button
                className={twMerge(
                  "input transition-all",
                  selectedObject.spawns == "player" && "bg-slate-600"
                )}
                onClick={() =>
                  updateObject(selectedObject.id, { spawns: "player" })
                }
              >
                Player
              </button>
              <button
                className={twMerge(
                  "input transition-all",
                  selectedObject.spawns == "zombie" && "bg-slate-600"
                )}
                onClick={() =>
                  updateObject(selectedObject.id, { spawns: "zombie" })
                }
              >
                Zombie
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SourceEditor({
  source,
  setSource,
}: {
  source: AssetSource;
  setSource: (source: AssetSource) => void;
}) {
  if (source.assetSource == "external") {
    return (
      <div>
        <input
          type="text"
          value={source.assetUrl}
          className="input"
          onChange={(e) => {
            setSource({ ...source, assetUrl: e.target.value });
          }}
        />
      </div>
    );
  }

  return null;
}
