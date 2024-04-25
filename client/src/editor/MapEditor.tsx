import { Container, Graphics, Sprite, TilingSprite, useApp } from "@pixi/react";
import {
  AssetCollider,
  AssetObject,
  MapObject,
  SpawnPoint,
} from "../../../server/src/game/mapEditor/editorTypes";
import { FullScreenStage } from "../components/graphics/FullScreenStage";
import { AssetObjectRendering } from "../components/level/AssetObjectInstance";
import { EditorCamera, EditorControls } from "./EditorCamera";
import { useEditor } from "./mapEditorStore";
import { Container as PIXIContainer, Texture } from "pixi.js";
import { ComponentProps, useCallback, useEffect, useRef } from "react";
import { useCamera } from "../components/stageContext";
import * as PIXI from "pixi.js";
import { MapEditorUI } from "./MapEditorUI";
import { spriteSheets } from "../assets/assetHandler";
import { TempFloor } from "../components/level/LevelInstanceRenderer";

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
      </FullScreenStage>
    </div>
  );
}

function VisualObjectsEditor() {
  const objects = useEditor((state) => state.level.objects);
  const { setSelectedObject } = useEditor();
  useEffect(() => {
    const keydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedObject(null);
      }
    };
    window.addEventListener("keydown", keydown);
    return () => {
      window.removeEventListener("keydown", keydown);
    };
  }, [setSelectedObject]);

  return (
    <>
      {objects.map((object) => {
        return <LevelObject key={object.id} asset={object} />;
      })}
    </>
  );
}

function LevelObject({ asset }: { asset: MapObject }) {
  const containerRef = useRef<PIXIContainer>(null);
  const updateObject = useEditor((state) => state.updateObject);
  const zoom = useEditor((state) => state.zoom);
  const camera = useCamera();
  const app = useApp();
  const { selectedObject, setSelectedObject } = useEditor();

  const thisSelected = selectedObject === asset.id;

  const dragging = useRef(false);
  const draggingOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const thisContainer = containerRef.current;

    const pointerDown = (e: PIXI.FederatedPointerEvent) => {
      if (!camera) return;

      const newPosition = e.getLocalPosition(camera);
      draggingOffset.current = {
        x: newPosition.x - asset.x,
        y: newPosition.y - asset.y,
      };

      setSelectedObject(asset.id);
      dragging.current = true;
      thisContainer.alpha = 0.5;
    };
    const pointerMove = (e: PIXI.FederatedPointerEvent) => {
      if (dragging.current) {
        if (!camera) return;
        const newPosition = e.getLocalPosition(camera);
        updateObject(asset.id, {
          x: Math.round(newPosition.x - draggingOffset.current.x),
          y: Math.round(newPosition.y - draggingOffset.current.y),
        });
      }
    };
    const pointerUp = () => {
      // round position
      updateObject(asset.id, {
        x: Math.round(asset.x),
        y: Math.round(asset.y),
      });
      dragging.current = false;
      thisContainer.alpha = 1;
    };

    thisContainer.on("pointerdown", pointerDown);
    app.stage.on("pointermove", pointerMove);
    app.stage.on("pointerup", pointerUp);

    return () => {
      thisContainer.off("pointerdown", pointerDown);
      app.stage.off("pointermove", pointerMove);
      app.stage.off("pointerup", pointerUp);
    };
  }, [
    camera,
    app.stage,
    asset.id,
    updateObject,
    asset.x,
    asset.y,
    zoom,
    setSelectedObject,
  ]);

  useEffect(() => {
    if (asset.objectType === "asset" && asset.tiling) {
      asset.width;
      asset.height;
      containerRef.current?.calculateBounds();
      containerRef.current?.updateTransform();
      console.log("recalculating bounds");
    }
    // @ts-expect-error - is not casted
  }, [asset.objectType, asset.tiling, asset.width, asset.height]);

  return (
    <>
      <Container ref={containerRef} cursor="pointer" eventMode="dynamic">
        {asset.objectType === "asset" && (
          <>
            <AssetObjectRendering
              asset={asset}
              tint={thisSelected ? 0xff3333 : 0xffffff}
            />
            {thisSelected && <VisualColliders asset={asset} />}
          </>
        )}
        {asset.objectType === "spawnPoint" && (
          <>
            <SpawnPointDisplay
              spawnPoint={asset}
              tint={thisSelected ? 0xff3333 : 0xffffff}
            />
          </>
        )}
      </Container>
    </>
  );
}

function VisualColliders({ asset }: { asset: AssetObject }) {
  return (
    <Container
      x={asset.x}
      y={asset.y}
      rotation={asset.rotation}
      scale={asset.scale}
    >
      {asset.colliders.map((collider, i) => {
        return <VisualCollider key={i} collider={collider} />;
      })}
    </Container>
  );
}

function VisualCollider({ collider }: { collider: AssetCollider }) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // only outline for now
      g.lineStyle(4, 0x00ff00);
      if (collider.shape.shape === "circle") {
        g.drawCircle(0, 0, collider.shape.radius);
      } else if (collider.shape.shape === "rectangle") {
        g.drawRect(
          -collider.shape.width / 2,
          -collider.shape.height / 2,
          collider.shape.width,
          collider.shape.height
        );
      }
    },
    [
      collider.shape.shape,
      // @ts-expect-error - is not casted
      collider.shape.radius,
      // @ts-expect-error - is not casted
      collider.shape.width,
      // @ts-expect-error - is not casted
      collider.shape.height,
    ]
  );

  return (
    <Graphics
      draw={draw}
      x={collider.x}
      y={collider.y}
      rotation={collider.rotation}
    />
  );
}

function SpawnPointDisplay({
  spawnPoint,
  ...props
}: { spawnPoint: SpawnPoint } & Partial<ComponentProps<typeof Sprite>>) {
  const scale = spawnPoint.spawns == "zombie" ? 0.4 : 0.5;

  return (
    <Container x={spawnPoint.x} y={spawnPoint.y}>
      <Sprite
        texture={
          spawnPoint.spawns == "player"
            ? Texture.from(
                "Top_Down_Survivor/rifle/idle/survivor-idle_rifle_0.png"
              )
            : spriteSheets.zombieAtlas.animations.walk[0]
        }
        scale={scale}
        anchor={{
          x: 0.5,
          y: 0.5,
        }}
        {...props}
      />
    </Container>
  );
}
