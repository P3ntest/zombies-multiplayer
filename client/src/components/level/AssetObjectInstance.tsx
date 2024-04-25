import { Sprite, TilingSprite } from "@pixi/react";
import { AssetObject } from "../../../../server/src/game/mapEditor/editorTypes";
import { Texture } from "pixi.js";
import { ComponentProps } from "react";

export function AssetObjectInstance({
  asset,
  ...spriteProps
}: { asset: AssetObject } & Partial<ComponentProps<typeof Sprite>> &
  Partial<ComponentProps<typeof TilingSprite>>) {
  const texture =
    asset.sprite.assetSource === "builtIn" ? asset.sprite.assetPath : undefined;
  const image =
    asset.sprite.assetSource === "external" ? asset.sprite.assetUrl : undefined;

  const common = {
    texture: texture ? Texture.from(texture) : undefined,
    image,
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
