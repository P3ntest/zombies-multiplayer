import { Container, useApp } from "@pixi/react";
import { MapObject } from "../../../server/src/game/mapEditor/editorTypes";
import { AssetObjectRendering } from "../components/level/AssetObjectInstance";
import { useEditor } from "./mapEditorStore";
import { Container as PIXIContainer } from "pixi.js";
import { memo, useEffect, useMemo, useRef } from "react";
import { useCamera } from "../components/stageContext";
import * as PIXI from "pixi.js";
import { SpawnPointDisplay } from "./MapEditor";
import { VisualColliders } from "./VisualColliders";
import lodash from "lodash";
import { GlowFilter } from "pixi-filters";

function _LevelObject({ asset }: { asset: MapObject }) {
  const containerRef = useRef<PIXIContainer>(null);
  const camera = useCamera();
  const app = useApp();
  const selectedObject = useEditor((state) => state.selectedObject);

  const thisSelected = selectedObject === asset.id;

  const dragging = useRef(false);
  const draggingOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const thisContainer = containerRef.current;

    const pointerDown = (e: PIXI.FederatedPointerEvent) => {
      const currentAsset = useEditor
        .getState()
        .level.objects?.find((o) => o.id === asset.id);
      if (!camera) return;

      const newPosition = e.getLocalPosition(camera);
      draggingOffset.current = {
        x: newPosition.x - currentAsset.x,
        y: newPosition.y - currentAsset.y,
      };

      useEditor.getState().setSelectedObject(asset.id);
      dragging.current = true;
      thisContainer.alpha = 0.5;
    };
    const pointerMove = (e: PIXI.FederatedPointerEvent) => {
      if (!dragging.current) return;
      if (!camera) return;
      const newPosition = e.getLocalPosition(camera);
      useEditor.getState().updateObject(
        asset.id,
        {
          x: Math.round(newPosition.x - draggingOffset.current.x),
          y: Math.round(newPosition.y - draggingOffset.current.y),
        },
        false
      );
    };
    const pointerUp = () => {
      if (!dragging.current) return;
      const currentAsset = useEditor
        .getState()
        .level.objects.find((o) => o?.id === asset?.id);
      // round position
      useEditor.getState().updateObject(currentAsset.id, {
        x: Math.round(currentAsset.x),
        y: Math.round(currentAsset.y),
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
  }, [camera, app.stage, thisSelected, asset.id]);

  const filters = useMemo(() => {
    return [new GlowFilter()];
  }, []);

  return (
    <>
      <Container
        ref={containerRef}
        cursor="pointer"
        eventMode="dynamic"
        zIndex={asset.objectType === "spawnPoint" ? 1000 : asset.zHeight ?? 100}
        filters={thisSelected ? filters : undefined}
      >
        {asset.objectType === "asset" && (
          <>
            <AssetObjectRendering asset={asset} />
            {thisSelected && <VisualColliders asset={asset} />}
          </>
        )}
        {asset.objectType === "spawnPoint" && (
          <>
            <SpawnPointDisplay spawnPoint={asset} />
          </>
        )}
      </Container>
    </>
  );
}

export const LevelObject = memo(_LevelObject, (prev, next) => {
  const areEqual = lodash.isEqual(prev.asset, next.asset);
  return areEqual;
});
