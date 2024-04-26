import { Container, Sprite } from "@pixi/react";
import { SpawnPoint } from "../../../server/src/game/mapEditor/editorTypes";
import { FullScreenStage } from "../components/graphics/FullScreenStage";
import { EditorCamera, EditorControls } from "./EditorCamera";
import { useEditor } from "./mapEditorStore";
import { Texture } from "pixi.js";
import { ComponentProps, useEffect, useMemo } from "react";
import { MapEditorUI } from "./MapEditorUI";
import { spriteSheets } from "../assets/assetHandler";
import { TempFloor } from "../components/level/LevelInstanceRenderer";
import { LevelObject } from "./LevelObject";
import { FpsTracker } from "../components/util/FpsDisplay";

export function MapEditor() {
  return (
    <div>
      <MapEditorUI />
      <FullScreenStage>
        <EditorCamera>
          <TempFloor />
          <EditorControls />
          <VisualObjectsEditor />
        </EditorCamera>
        <FpsTracker />
      </FullScreenStage>
    </div>
  );
}

function VisualObjectsEditor() {
  console.time("VisualObjectsEditor");
  const objects = useEditor((state) => state.level.objects);
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        useEditor.getState().setSelectedObject(null);
      } else if (e.key == "Delete") {
        if (useEditor.getState().selectedObject) {
          useEditor
            .getState()
            .deleteObject(useEditor.getState().selectedObject);
        }
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, []);

  const returning = (
    <Container sortableChildren>
      {objects.map((object) => {
        return <LevelObject key={object.id} asset={object} />;
      })}
    </Container>
  );
  console.timeEnd("VisualObjectsEditor");
  return returning;
}

export function SpawnPointDisplay({
  spawnPoint,
  ...props
}: { spawnPoint: SpawnPoint } & Partial<ComponentProps<typeof Sprite>>) {
  const scale = spawnPoint.spawns == "zombie" ? 0.4 : 0.5;

  const playerTexture = useMemo(
    () =>
      Texture.from("Top_Down_Survivor/rifle/idle/survivor-idle_rifle_0.png"),
    []
  );

  return (
    <Container x={spawnPoint.x} y={spawnPoint.y}>
      <Sprite
        texture={
          spawnPoint.spawns == "player"
            ? playerTexture
            : spriteSheets.zombieAtlas.animations.walk[0]
        }
        scale={scale}
        anchor={useMemo(
          () => ({
            x: 0.5,
            y: 0.5,
          }),
          []
        )}
        {...props}
      />
    </Container>
  );
}
