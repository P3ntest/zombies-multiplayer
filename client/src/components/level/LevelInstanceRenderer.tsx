import { TilingSprite } from "@pixi/react";
import {
  GameLevel,
  MapObject,
} from "../../../../server/src/game/mapEditor/editorTypes";
import {
  AssetObjectColliders,
  AssetObjectRendering,
} from "./AssetObjectInstance";
import { Texture } from "pixi.js";

export function LevelInstanceRenderer({ level }: { level: GameLevel }) {
  return (
    <>
      <TempFloor />
      <LevelObjects objects={level.objects} />
    </>
  );
}

function LevelObjects({ objects }: { objects: MapObject[] }) {
  return objects.map((object) => {
    return <LevelObject key={object.id} asset={object} />;
  });
}

function LevelObject({ asset }: { asset: MapObject }) {
  if (asset.objectType == "asset") {
    return (
      <>
        <AssetObjectRendering asset={asset} />
        <AssetObjectColliders asset={asset} />
      </>
    );
  }
}

export function TempFloor() {
  return (
    <TilingSprite
      tilePosition={{ x: 0, y: 0 }}
      texture={Texture.from("/assets/sand.jpg")}
      width={20000}
      height={20000}
      x={-10000}
      y={-10000}
    />
  );
}
