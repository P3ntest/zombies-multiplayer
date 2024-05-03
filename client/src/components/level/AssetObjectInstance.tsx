import { Sprite, TilingSprite } from "@pixi/react";
import {
  AssetCollider,
  AssetObject,
} from "../../../../server/src/game/mapEditor/editorTypes";
import { Texture, Assets } from "pixi.js";
import { ComponentProps, useEffect, useMemo, useState } from "react";
import { useBodyRef } from "../../lib/physics/hooks";
import { Bodies } from "matter-js";
import { useCustomAsset } from "../../editor/assets/hooks";
import { DropShadowFilter } from "pixi-filters";
import { useLevelShadowSettings } from "./levelContext";
import { useLevelObjectShadow } from "../graphics/filters";

export function AssetObjectRendering({
  asset,
  ...spriteProps
}: { asset: AssetObject } & Partial<ComponentProps<typeof Sprite>> &
  Partial<ComponentProps<typeof TilingSprite>>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customAssetUrl = useCustomAsset((asset.sprite as any).uploadId);
  const missingTexture = useMemo(() => {
    return Texture.from("/assets/editor/missing.png");
  }, []);

  const [actualTexture, setActualTexture] = useState<Texture | null>(
    missingTexture
  );

  useEffect(() => {
    if (asset.sprite.assetSource === "custom") {
      Assets.load(customAssetUrl)
        .then(setActualTexture)
        .catch((e) => {
          console.error(e);
          setActualTexture(missingTexture);
          console.error("Failed to load asset", customAssetUrl);
        });
    } else if (asset.sprite.assetSource === "builtIn") {
      Assets.load(asset.sprite.assetPath)
        .then(setActualTexture)
        .catch(() => {
          setActualTexture(missingTexture);
          console.error("Failed to load asset");
        });
    }
  }, [asset.sprite, missingTexture, customAssetUrl]);

  const objectShadow = useLevelObjectShadow(asset.shadow?.offset ?? 0);

  const common = useMemo(
    () =>
      ({
        texture: actualTexture ?? missingTexture,
        x: asset.x,
        y: asset.y,
        rotation: asset.rotation,
        scale: asset.scale,
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        filters: asset.shadow?.enabled ? [objectShadow] : undefined,
      } satisfies Partial<
        ComponentProps<typeof Sprite> &
          Partial<ComponentProps<typeof TilingSprite>>
      >),
    [
      actualTexture,
      missingTexture,
      objectShadow,
      asset.shadow?.enabled,
      asset.x,
      asset.y,
      asset.rotation,
      asset.scale,
    ]
  );

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
        {...spriteProps}
      />
    );
  } else {
    return (
      <Sprite
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        {...(common as any)}
        {...spriteProps}
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
