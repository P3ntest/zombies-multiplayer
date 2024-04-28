/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor } from "./mapEditorStore";
import "./editor.css";
import {
  AssetCollider,
  AssetSource,
  MapObject,
} from "../../../server/src/game/mapEditor/editorTypes";
import { twMerge } from "tailwind-merge";

import { FileOptions } from "./FilesUI";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { AssetLibrary } from "./AssetLibrary";
import { useCustomAsset } from "./assets/hooks";
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

  const navigate = useNavigate();

  return (
    <div className="absolute top-0 left-0 p-5 w-96">
      <div className="bg-slate-900 p-4 rounded-xl pointer-events-auto flex flex-col gap-4">
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
        <FileOptions />
        <button
          className="button"
          onClick={() => {
            navigate("/");
          }}
        >
          Back to Main Menu
        </button>
      </div>
    </div>
  );
}

function Inspector() {
  const selectedObject = useEditor((state) =>
    state.level.objects.find((o) => o.id === state.selectedObject)
  );
  const updateObject = useEditor((state) => state.updateObject);
  const addObject = useEditor((state) => state.addObject);
  const deleteObject = useEditor((state) => state.deleteObject);

  if (!selectedObject) return null;

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
    <div className="absolute top-0 right-0 p-5 w-96 max-h-screen overflow-y-auto">
      <div className="bg-slate-900 p-4 rounded-xl pointer-events-auto max-h-full overflow-y-scroll">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-white font-bold text-xl mb-3">Inspector</h1>
          <div className="flex flex-row gap-2">
            <button
              className="button"
              onClick={() => {
                addObject({
                  ...selectedObject,
                  id: Math.random().toString(36).substr(2, 5),
                  x: selectedObject.x + 10,
                  y: selectedObject.y + 10,
                });
              }}
            >
              Duplicate
            </button>
            <button
              className="button"
              onClick={() => deleteObject(selectedObject.id)}
            >
              Delete
            </button>
          </div>
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

        {selectedObject.objectType === "asset" && (
          <div>
            <div className="flex flex-row gap-2 items-center my-2">
              <h2 className="text-white font-bold text-lg mb-1">Height</h2>
              <input
                type="range"
                value={selectedObject.zHeight}
                min={0}
                max={100}
                step={1}
                onChange={(e) =>
                  updateObject(selectedObject.id, {
                    zHeight: parseInt(e.target.value),
                  } as any)
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
            <div className="flex flex-row gap-2 justify-stretch">
              <div className="flex flex-col justify-stretch flex-1">
                <h2 className="text-white font-bold text-lg mb-1">Rotation</h2>

                <input
                  type="range"
                  value={Math.floor(selectedObject.rotation * (180 / Math.PI))}
                  min={0}
                  max={360}
                  step={1}
                  onChange={(e) => {
                    const value = Math.floor(parseFloat(e.target.value)) || 0;
                    updateObject(selectedObject.id, {
                      rotation: value * (Math.PI / 180),
                    });
                  }}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
              <div className="flex flex-col justify-stretch flex-1">
                <h2 className="text-white font-bold text-lg mb-1">Scale</h2>
                <input
                  type="range"
                  value={selectedObject.scale}
                  min={0.04}
                  max={5}
                  step={0.01}
                  onChange={(e) =>
                    updateObject(selectedObject.id, {
                      scale: parseFloat(e.target.value),
                    } as any)
                  }
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                />
              </div>
            </div>
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
            <SourceEditor
              source={selectedObject.sprite}
              setSource={(source) =>
                updateObject(selectedObject.id, { sprite: source })
              }
            />
            <ColliderEditor />
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
  const customAssetUrl = useCustomAsset((source as any).uploadId);
  const [libraryOpen, setLibraryOpen] = useState(false);

  return (
    <div>
      <h2 className="text-white font-bold text-lg mb-1">Source</h2>
      <select
        value={source.assetSource}
        className="input"
        onChange={(e) => {
          setSource({ assetSource: e.target.value } as any);
        }}
      >
        <option value="builtIn">Built In</option>
        <option value="custom">Custom</option>
      </select>
      {source.assetSource == "builtIn" ? (
        <div>
          <input
            type="text"
            value={source.assetPath}
            className="input"
            onChange={(e) => {
              setSource({ ...source, assetPath: e.target.value });
            }}
          />
        </div>
      ) : (
        <div>
          <AssetLibrary
            open={libraryOpen}
            onClose={() => setLibraryOpen(false)}
            onSelect={(id) => {
              setSource({ assetSource: "custom", uploadId: id });
              setLibraryOpen(false);
            }}
          />
          <div className="flex flex-row gap-3 items-center">
            {source.uploadId && (
              <img
                src={customAssetUrl}
                className="rounded-lg w-40 h-40"
                alt=""
              />
            )}
            <button
              className="button"
              onClick={() => {
                setLibraryOpen(true);
              }}
            >
              Select Asset
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ColliderEditor() {
  const colliders = useEditor((state) => {
    const obj = state.level.objects.find((o) => o.id === state.selectedObject);
    if (obj?.objectType !== "asset") return null;
    return obj.colliders;
  });
  const selectedObjectId = useEditor((state) => state.selectedObject);
  const updateObject = useEditor((state) => state.updateObject);
  const updateColliders = (colliders: AssetCollider[]) => {
    updateObject(selectedObjectId!, { colliders }, true);
  };

  return (
    <div className="">
      <div className="flex flex-row items-center justify-between">
        <h1 className="text-white font-bold text-xl mb-3">Colliders</h1>
        <button
          className="button"
          onClick={() => {
            const newCollider: AssetCollider = {
              shape: {
                shape: "rectangle",
                height: 100,
                width: 100,
              },
              x: 0,
              y: 0,
              rotation: 0,
            };
            updateColliders([...colliders!, newCollider]);
          }}
        >
          Add Collider
        </button>
      </div>
      <div className="flex flex-col gap-2 my-2">
        {colliders?.map((collider, index) => {
          return (
            <div
              className="flex flex-col gap-1 items-stretch p-2 bg-slate-700 rounded relative"
              key={index}
            >
              <div className="top-0 right-0 absolute p-2">
                <button
                  className=" font-black text-white text-xl hover:bg-slate-900 rounded-full w-6 h-6 flex items-center justify-center hover:scale-125"
                  onClick={() => {
                    const newColliders = [...colliders!];
                    newColliders.splice(index, 1);
                    updateColliders(newColliders);
                  }}
                >
                  -
                </button>
              </div>
              <div>
                <h2 className="text-white font-bold text-lg mb-1">Shape</h2>
                <select
                  value={collider.shape.shape}
                  className="input"
                  onChange={(e) => {
                    const newColliders = [...colliders!];
                    newColliders[index] = {
                      ...collider,
                      shape: {
                        shape: e.target.value as "circle" | "rectangle",
                        ...(e.target.value === "circle"
                          ? { radius: 100 }
                          : { width: 100, height: 100 }),
                      },
                    };
                    updateColliders(newColliders);
                  }}
                >
                  <option value="circle">Circle</option>
                  <option value="rectangle">Rectangle</option>
                </select>
              </div>
              <h2 className="text-white font-bold text-lg mb-1">Offset</h2>
              <div className="flex flex-row gap-2">
                <input
                  type="number"
                  value={collider.x}
                  className="input"
                  onChange={(e) => {
                    const newColliders = [...colliders!];
                    newColliders[index] = {
                      ...collider,
                      x: parseFloat(e.target.value),
                    };
                    updateColliders(newColliders);
                  }}
                />

                <input
                  type="number"
                  value={collider.y}
                  className="input"
                  onChange={(e) => {
                    const newColliders = [...colliders!];
                    newColliders[index] = {
                      ...collider,
                      y: parseFloat(e.target.value),
                    };
                    updateColliders(newColliders);
                  }}
                />
              </div>
              {collider.shape.shape === "circle" && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Radius</h2>
                  <input
                    type="number"
                    value={collider.shape.radius}
                    className="input"
                    onChange={(e) => {
                      const newColliders = [...colliders!];
                      newColliders[index] = {
                        ...collider,
                        shape: {
                          ...collider.shape,
                          //@ts-expect-error this is fine
                          radius: parseFloat(e.target.value),
                        },
                      };
                      updateColliders(newColliders);
                    }}
                  />
                </div>
              )}
              {collider.shape.shape === "rectangle" && (
                <div>
                  <h2 className="text-white font-bold text-lg mb-1">Width</h2>
                  <input
                    type="number"
                    value={collider.shape.width}
                    className="input"
                    onChange={(e) => {
                      const newColliders = [...colliders!];
                      newColliders[index] = {
                        ...collider,
                        shape: {
                          ...collider.shape,
                          //@ts-expect-error this is fine
                          width: parseFloat(e.target.value),
                        },
                      };
                      updateColliders(newColliders);
                    }}
                  />
                  <h2 className="text-white font-bold text-lg mb-1">Height</h2>
                  <input
                    type="number"
                    value={collider.shape.height}
                    className="input"
                    onChange={(e) => {
                      const newColliders = [...colliders!];
                      newColliders[index] = {
                        ...collider,
                        shape: {
                          ...collider.shape,
                          //@ts-expect-error this is fine
                          height: parseFloat(e.target.value),
                        },
                      };
                      updateColliders(newColliders);
                    }}
                  />

                  <div>
                    <h2 className="text-white font-bold text-lg mb-1">
                      Rotation
                    </h2>
                    <input
                      type="number"
                      value={Math.floor(collider.rotation * (180 / Math.PI))}
                      className="input"
                      onChange={(e) => {
                        const newColliders = [...colliders!];
                        newColliders[index] = {
                          ...collider,
                          rotation:
                            parseFloat(e.target.value) * (Math.PI / 180),
                        };
                        updateColliders(newColliders);
                      }}
                    />
                  </div>
                </div>
              )}
              <div className="flex flex-row items-center justify-between gap-3">
                <h2 className="text-white font-bold text-lg mb-1">
                  Destroys Bullets
                </h2>
                <input
                  className="w-6 h-6 rounded-xl"
                  type="checkbox"
                  checked={collider.destroyBullet ?? true}
                  onChange={(e) => {
                    const newColliders = [...colliders!];
                    newColliders[index] = {
                      ...collider,
                      destroyBullet: e.target.checked,
                    };
                    updateColliders(newColliders);
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
