/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEditor } from "./mapEditorStore";
import {
  AssetCollider,
  AssetSource,
} from "../../../server/src/game/mapEditor/editorTypes";
import { twMerge } from "tailwind-merge";
import { FileOptions, MyMapsModal } from "./FilesUI";
import { ComponentProps, ReactNode, useEffect, useState } from "react";
import { AssetLibrary } from "./AssetLibrary";
import { useCustomAsset } from "./assets/hooks";
import { CreateAssetsMenu } from "./CreateAssetsUI";
import { Link } from "react-router-dom";

export function MapEditorUI({ children }: { children: ReactNode }) {
  const currentView = useEditor((state) => state.currentView);
  const setView = useEditor((state) => state.setCurrentView);
  return (
    <div className="">
      {currentView == "editor" && children}
      <div className="fixed top-0 left-0 w-screen h-screen pointer-events-none">
        <div className="pointer-events-auto">
          <NewNavBar />
        </div>
        {currentView == "editor" && (
          <>
            <div className="flex flex-row w-screen">
              <div className="flex-1 pointer-events-none"></div>
              <div className="pointer-events-auto">
                <Inspector />
              </div>
            </div>
          </>
        )}
        {currentView == "myMaps" && (
          <div className="bg-base-300 p-4 h-screen pb-20 overflow-y-auto pointer-events-auto relative">
            <MyMapsModal />
            <button
              onClick={() => {
                setView("editor");
              }}
              className="btn absolute top-4 right-4 btn-accent pointer-events-auto"
            >
              Back to Editor
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NewNavBar() {
  return (
    <div className="navbar bg-base-300">
      <div className="navbar-start">
        <a className="text-lg font-bold px-2">Map Editor</a>
        <FileOptions />
        <CreateAssetsMenu />
      </div>
      <div className="navbar-end">
        <Link to="/" className="btn btn-secondary btn-sm">
          Back to Main Menu
        </Link>
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

  const [tab, setTab] = useState<"transform" | "colliders">("transform");

  useEffect(() => {
    setTab("transform");
  }, [selectedObject?.id]);

  if (!selectedObject) {
    return null;
  }

  return (
    <div className="h-full">
      <div className="bg-base-300 p-4 h-screen pb-20 overflow-y-auto flex flex-col gap-4">
        <div className="flex flex-row items-center justify-between">
          <h1 className="text-white font-bold text-xl mb-3 pr-10">Inspector</h1>
          <div className="flex flex-row gap-2">
            <button
              className="btn btn-sm btn-accent"
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
              className="btn btn-sm btn-error"
              onClick={() => deleteObject(selectedObject.id)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="tabs tabs-boxed tabs-sm">
          <a
            role="tab"
            className={twMerge("tab", tab === "transform" && "tab-active")}
            onClick={() => {
              setTab("transform");
            }}
          >
            Transform
          </a>
          {selectedObject.objectType === "asset" && (
            <a
              role="tab"
              className={twMerge("tab", tab === "colliders" && "tab-active")}
              onClick={() => {
                setTab("colliders");
              }}
            >
              Colliders
            </a>
          )}
        </div>
        {tab === "transform" && (
          <>
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Position</h2>
              <div className="flex flex-row gap-2 max-w-full">
                <SmartNumberInput
                  number={selectedObject.x}
                  setNumber={(value) =>
                    updateObject(selectedObject.id, { x: value })
                  }
                  className="input input-sm flex-1 input-secondary"
                  step={10}
                />
                <SmartNumberInput
                  number={selectedObject.y}
                  setNumber={(value) =>
                    updateObject(selectedObject.id, { y: value })
                  }
                  className="input input-sm flex-1 input-secondary"
                  step={10}
                />
              </div>
            </div>
            {selectedObject.objectType === "asset" && (
              <>
                <div>
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
                    className="range range-sm range-secondary"
                  />
                </div>
                <div className="flex flex-row gap-2 justify-stretch">
                  <div className="flex flex-col justify-stretch flex-1">
                    <h2 className="text-white font-bold text-lg mb-1">
                      Rotation
                    </h2>

                    <input
                      type="range"
                      value={Math.floor(
                        selectedObject.rotation * (180 / Math.PI)
                      )}
                      min={0}
                      max={360}
                      step={1}
                      onChange={(e) => {
                        const value =
                          Math.floor(parseFloat(e.target.value)) || 0;
                        updateObject(selectedObject.id, {
                          rotation: value * (Math.PI / 180),
                        });
                      }}
                      className="range range-sm range-secondary"
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
                      className="range range-sm range-secondary"
                    />
                  </div>
                </div>
                <SourceEditor
                  source={selectedObject.sprite}
                  setSource={(source) =>
                    updateObject(selectedObject.id, { sprite: source })
                  }
                />
                <div className="flex flex-row items-center gap-4">
                  <h2 className="text-white font-bold text-lg my-2">Tiling</h2>
                  <input
                    type="checkbox"
                    checked={selectedObject.tiling}
                    className="checkbox checkbox-secondary"
                    onChange={(e) =>
                      updateObject(selectedObject.id, {
                        tiling: e.target.checked,
                      })
                    }
                  />
                </div>
                {selectedObject.tiling && (
                  <div>
                    <div className="flex flex-row items-center gap-2">
                      <div>
                        <h2 className="text-white font-bold text-lg mb-1">
                          Tiling Width
                        </h2>
                        <SmartNumberInput
                          number={selectedObject.width}
                          setNumber={(value) =>
                            updateObject(selectedObject.id, {
                              width: value,
                            } as any)
                          }
                          className="input input-sm input-secondary"
                          step={20}
                        />
                      </div>
                      <div>
                        <h2 className="text-white font-bold text-lg mb-1">
                          Tiling Height
                        </h2>
                        <SmartNumberInput
                          number={selectedObject.height}
                          setNumber={(value) =>
                            updateObject(selectedObject.id, {
                              height: value,
                            } as any)
                          }
                          className="input input-sm input-secondary"
                          step={20}
                        />
                      </div>
                    </div>
                    <button
                      className="btn btn-sm btn-secondary mt-2"
                      onClick={() => {
                        updateObject(selectedObject.id, {
                          ...selectedObject,
                          colliders: [
                            ...selectedObject.colliders,
                            {
                              shape: {
                                shape: "rectangle",
                                width: selectedObject.width,
                                height: selectedObject.height,
                                destroyBullet: true,
                              },
                              x: 0,
                              y: 0,
                              rotation: 0,
                            } as AssetCollider,
                          ],
                        });
                      }}
                    >
                      Add as Collider
                    </button>
                  </div>
                )}
                <div className="flex flex-row items-center gap-4">
                  <h2 className="text-white font-bold text-lg my-2">Shadows</h2>
                  <input
                    type="checkbox"
                    checked={!!selectedObject.shadow?.enabled}
                    className="checkbox checkbox-secondary"
                    onChange={(e) =>
                      updateObject(selectedObject.id, {
                        shadow: {
                          ...selectedObject.shadow,
                          enabled: e.target.checked,
                        },
                      })
                    }
                  />
                </div>
                {selectedObject.shadow?.enabled && (
                  <div>
                    <h2 className="text-white font-bold text-lg mb-1">
                      Shadow Offset
                    </h2>
                    <input
                      type="range"
                      className="range"
                      value={selectedObject.shadow.offset}
                      min={0}
                      max={5}
                      step={1}
                      onChange={(e) =>
                        updateObject(selectedObject.id, {
                          shadow: {
                            ...selectedObject.shadow,
                            offset: parseInt(e.target.value),
                          },
                        })
                      }
                    />
                  </div>
                )}
              </>
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
          </>
        )}
        {tab === "colliders" && <CollidersEditor />}
      </div>
    </div>
  );
}

// this will only parse the number at the end
function SmartNumberInput({
  number,
  setNumber,
  ...props
}: {
  number: number;
  setNumber: (value: number) => void;
} & ComponentProps<"input">) {
  const [previewValue, setPreviewValue] = useState<number | string>(number);
  useEffect(() => {
    setPreviewValue(number);
  }, [number]);

  return (
    <input
      type="number"
      value={previewValue}
      onBlur={(e) => {
        const parsed = parseFloat(e.target.value);
        if (!Number.isNaN(parsed)) {
          setNumber(parsed);
        } else {
          setPreviewValue(number);
        }
      }}
      onChange={(e) => {
        setPreviewValue(e.target.value);
        if (!Number.isNaN(parseFloat(e.target.value))) {
          setNumber(parseFloat(e.target.value));
        }
      }}
      {...props}
    />
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

  if (source.assetSource == "builtIn") {
    return (
      <div>
        Legacy Path: {source.assetPath}
        <button
          onClick={() => {
            setSource({ assetSource: "custom", uploadId: source.assetPath });
          }}
        >
          Switch to new version
        </button>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-white font-bold text-xl mb-1">Sprite Source</h2>

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
            <img src={customAssetUrl} className="rounded-lg w-40 h-40" alt="" />
          )}
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => {
              setLibraryOpen(true);
            }}
          >
            Select Asset
          </button>
        </div>
      </div>
    </div>
  );
}

function CollidersEditor() {
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
          className="btn btn-sm btn-secondary"
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
        {colliders?.map((collider, index) => (
          <ColliderEditor
            key={index}
            collider={collider}
            setCollider={(newCollider) => {
              const newColliders = [...colliders!];
              newColliders[index] = newCollider;
              updateColliders(newColliders);
            }}
            deleteCollider={() => {
              const newColliders = [...colliders!];
              newColliders.splice(index, 1);
              updateColliders(newColliders);
            }}
          />
        ))}
      </div>
    </div>
  );
}

function ColliderEditor({
  collider,
  setCollider,
  deleteCollider,
}: {
  collider: AssetCollider;
  setCollider: (collider: AssetCollider) => void;
  deleteCollider: () => void;
}) {
  return (
    <div className="card bg-neutral p-2 relative">
      <div className="top-0 right-0 absolute p-2">
        <button
          className="btn btn-xs btn-error btn-outline"
          onClick={deleteCollider}
        >
          Remove
        </button>
      </div>
      <div>
        <h2 className="text-white font-bold text-lg mb-1">Shape</h2>
        <div className="tabs tabs-boxed tabs-sm">
          <a
            role="tab"
            className={twMerge(
              "tab",
              collider.shape.shape === "rectangle" && "tab-active"
            )}
            onClick={() =>
              setCollider({
                ...collider,
                shape: {
                  shape: "rectangle",
                  width: 100,
                  height: 100,
                },
              })
            }
          >
            Rectangle
          </a>
          <a
            role="tab"
            className={twMerge(
              "tab",
              collider.shape.shape === "circle" && "tab-active "
            )}
            onClick={() =>
              setCollider({
                ...collider,
                shape: {
                  shape: "circle",
                  radius: 50,
                },
              })
            }
          >
            Circle
          </a>
        </div>
      </div>
      <h2 className="text-white font-bold text-lg mb-1">Offset</h2>
      <div className="flex flex-row gap-2">
        <SmartNumberInput
          number={collider.x}
          setNumber={(value) => setCollider({ ...collider, x: value })}
          className="input input-sm input-secondary"
          step={20}
        />

        <SmartNumberInput
          number={collider.y}
          setNumber={(value) => setCollider({ ...collider, y: value })}
          className="input input-sm input-secondary"
          step={20}
        />
      </div>
      {collider.shape.shape === "circle" && (
        <div>
          <h2 className="text-white font-bold text-lg mb-1">Radius</h2>
          <SmartNumberInput
            number={collider.shape.radius}
            setNumber={(value) =>
              setCollider({
                ...collider,
                shape: {
                  ...collider.shape,
                  shape: "circle",
                  radius: value,
                },
              })
            }
            className="input input-sm input-secondary"
            step={20}
          />
        </div>
      )}
      {collider.shape.shape === "rectangle" && (
        <div>
          <div className="flex flex-row gap-2">
            <div>
              <h2 className="text-white font-bold text-lg mb-1">Width</h2>
              <SmartNumberInput
                number={collider.shape.width}
                setNumber={(value) =>
                  setCollider({
                    ...collider,
                    shape: {
                      ...collider.shape,
                      shape: "rectangle",
                      width: value,
                    },
                  })
                }
                className="input input-sm input-secondary"
                step={20}
              />
            </div>

            <div>
              <h2 className="text-white font-bold text-lg mb-1">Height</h2>
              <SmartNumberInput
                number={collider.shape.height}
                setNumber={(value) =>
                  setCollider({
                    ...collider,
                    shape: {
                      ...collider.shape,
                      shape: "rectangle",
                      height: value,
                    },
                  })
                }
                className="input input-sm input-secondary"
                step={20}
              />
            </div>
          </div>

          <div>
            <h2 className="text-white font-bold text-lg mb-1">Rotation</h2>
            <input
              type="range"
              value={collider.rotation * (180 / Math.PI)}
              min={0}
              max={180}
              step={1}
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                setCollider({
                  ...collider,
                  rotation: value * (Math.PI / 180),
                });
              }}
              className="range range-sm range-secondary"
            />
          </div>
        </div>
      )}
      <div className="flex flex-row items-center justify-between gap-3">
        <h2 className="text-white font-bold text-lg mb-1">Destroys Bullets</h2>
        <input
          className="checkbox checkbox-secondary"
          type="checkbox"
          checked={collider.destroyBullet ?? true}
          onChange={(e) => {
            setCollider({ ...collider, destroyBullet: e.target.checked });
          }}
        />
      </div>
    </div>
  );
}
