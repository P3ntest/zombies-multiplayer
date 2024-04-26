import { Sprite, TilingSprite } from "@pixi/react";
import {
  AssetCollider,
  AssetObject,
} from "../../../../server/src/game/mapEditor/editorTypes";
import { Texture, Assets } from "pixi.js";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { useBodyRef } from "../../lib/physics/hooks";
import { Bodies } from "matter-js";

export function AssetObjectRendering({
  asset,
  ...spriteProps
}: { asset: AssetObject } & Partial<ComponentProps<typeof Sprite>> &
  Partial<ComponentProps<typeof TilingSprite>>) {
  const missingTexture = useMemo(() => {
    return Texture.from("/assets/editor/missing.png");
  }, []);

  const [actualTexture, setActualTexture] = useState<Texture | null>(
    missingTexture
  );

  useEffect(() => {
    Assets.load(asset.sprite.assetPath)
      .then(setActualTexture)
      .catch(() => {
        setActualTexture(missingTexture);
        console.error("Failed to load asset", asset.sprite.assetPath);
      });
  }, [asset.sprite, missingTexture]);

  const common = {
    texture: actualTexture ?? missingTexture,
    x: asset.x,
    y: asset.y,
    rotation: asset.rotation,
    scale: asset.scale,
    anchor: {
      x: 0.5,
      y: 0.5,
    },
    ...spriteProps,
  };

  if (asset.tiling) {
    return (
      <TilingSprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(common as any)}
        tilePosition={{
          x: 0,
          y: 0,
        }}
        width={asset.width}
        height={asset.height}
      />
    );
  } else {
    return (
      <Sprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(common as any)}
      />
    );
  }
}

export function AssetObjectColliders({ asset }: { asset: AssetObject }) {
  return asset.colliders.map((collider, index) => {
    return (
      <AssetObjectCollider key={index} collider={collider} asset={asset} />
    );
  });
}

function AssetObjectCollider({
  collider,
  asset,
}: {
  collider: AssetCollider;
  asset: AssetObject;
}) {
  const tags = useMemo(() => {
    const tags = ["obstacle"];
    if (collider.destroyBullet) {
      tags.push("destroyBullet");
    }
    return tags;
  }, [collider.destroyBullet]);
  useBodyRef(
    () => {
      // the asset has x, y, rotation, scale
      // the collider has shape, x, y, rotation
      // the asset transform needs to be applied to the collider

      const point = {
        x: collider.x,
        y: collider.y,
      };

      // first apply the asset scale
      point.x *= asset.scale;
      point.y *= asset.scale;

      // then apply the asset rotation
      const angle = asset.rotation;
      const x = point.x;
      const y = point.y;
      point.x = x * Math.cos(angle) - y * Math.sin(angle);
      point.y = x * Math.sin(angle) + y * Math.cos(angle);

      // then apply the asset position
      point.x += asset.x;
      point.y += asset.y;

      if (collider.shape.shape === "circle") {
        return Bodies.circle(
          point.x,
          point.y,
          collider.shape.radius * asset.scale,
          {
            isStatic: true,
          }
        );
      } else if (collider.shape.shape === "rectangle") {
        return Bodies.rectangle(
          point.x,
          point.y,
          collider.shape.width * asset.scale,
          collider.shape.height * asset.scale,
          {
            angle: collider.rotation + asset.rotation,
            isStatic: true,
          }
        );
      } else {
        return collider.shape as never;
      }
    },
    {
      tags,
    }
  );
  return null;
}
