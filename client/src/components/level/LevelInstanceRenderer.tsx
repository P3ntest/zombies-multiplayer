import { Container, Stage, TilingSprite } from "@pixi/react";
import {
  GameLevel,
  MapObject,
} from "../../../../server/src/game/mapEditor/editorTypes";
import {
  AssetObjectColliders,
  AssetObjectRendering,
} from "./AssetObjectInstance";
import { Texture } from "pixi.js";
import { useMemo } from "react";
import { produce } from "immer";
import { SpawnPointDisplay } from "../../editor/MapEditor";

export function LevelInstanceRenderer({ level }: { level: GameLevel }) {
  return (
    <>
      <TempFloor />
      <LevelObjects objects={level.objects} />
    </>
  );
}

export function MapPreviewRenderer({
  level,
  size = 250,
}: {
  level: GameLevel;
  size: number;
}) {
  //filter out colliders
  const filtered = useMemo(() => {
    return produce(level, (draft) => {
      draft.objects.forEach((object) => {
        if (object.objectType == "asset") {
          object.colliders = [];
        }
      });
    });
  }, [level]);
  return (
    <Stage raf={false} width={size} height={size}>
      <Container
        anchor={{
          x: 0.5,
          y: 0.5,
        }}
        position={{
          x: size / 2,
          y: size / 2,
        }}
        scale={{
          x: 0.1 * (size / 250),
          y: 0.1 * (size / 250),
        }}
      >
        <TempFloor />
        <LevelObjects objects={filtered.objects} renderSpawnPoints />
      </Container>
    </Stage>
  );
}

function LevelObjects({
  objects,
  renderSpawnPoints = false,
}: {
  objects: MapObject[];
  renderSpawnPoints?: boolean;
}) {
  return objects.map((object) => {
    return (
      <LevelObject
        key={object.id}
        asset={object}
        renderSpawnPoints={renderSpawnPoints}
      />
    );
  });
}

function LevelObject({
  asset,
  renderSpawnPoints,
}: {
  asset: MapObject;
  renderSpawnPoints?: boolean;
}) {
  if (asset.objectType == "asset") {
    return (
      <>
        <AssetObjectRendering asset={asset} />
        <AssetObjectColliders asset={asset} />
      </>
    );
  } else if (asset.objectType == "spawnPoint" && renderSpawnPoints) {
    return <SpawnPointDisplay spawnPoint={asset} />;
  }
  return null;
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
