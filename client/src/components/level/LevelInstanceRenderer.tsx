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
import { SpawnPointDisplay } from "../../editor/MapEditor";
import { LogtoProvider } from "@logto/react";
import { logtoConfig } from "../../lib/auth/logto";
import { TrpcWrapper } from "../../lib/trpc/TrpcWrapper";

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
    return {
      ...level,
      objects: level.objects.filter(
        (object) => object.objectType !== "spawnPoint"
      ),
    };
  }, [level]);
  console.log("filtered", filtered);
  return (
    <Stage raf={false} width={size} height={size}>
      <LogtoProvider config={logtoConfig}>
        <TrpcWrapper>
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
            <LevelObjects
              renderColliders={false}
              objects={filtered.objects}
              renderSpawnPoints
            />
          </Container>
        </TrpcWrapper>
      </LogtoProvider>
    </Stage>
  );
}

function LevelObjects({
  objects,
  renderSpawnPoints = false,
  renderColliders = true,
}: {
  objects: MapObject[];
  renderSpawnPoints?: boolean;
  renderColliders?: boolean;
}) {
  return (
    <Container>
      {objects
        .sort(
          (a, b) =>
            (b.objectType == "asset" ? b.height : 0) -
            (a.objectType == "asset" ? a.height : 0)
        )
        .map((object) => {
          return (
            <LevelObject
              key={object.id}
              asset={object}
              renderSpawnPoints={renderSpawnPoints}
              renderColliders={renderColliders}
            />
          );
        })}
    </Container>
  );
}

function LevelObject({
  asset,
  renderSpawnPoints,
  renderColliders,
}: {
  asset: MapObject;
  renderSpawnPoints?: boolean;
  renderColliders?: boolean;
}) {
  if (asset.objectType == "asset") {
    return (
      <>
        <AssetObjectRendering asset={asset} />
        {renderColliders && <AssetObjectColliders asset={asset} />}
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
