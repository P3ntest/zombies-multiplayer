import { Container, Graphics } from "@pixi/react";
import {
  AssetCollider,
  AssetObject,
} from "../../../server/src/game/mapEditor/editorTypes";
import { memo, useCallback } from "react";
import * as PIXI from "pixi.js";
import lodash from "lodash";

export function VisualColliders({ asset }: { asset: AssetObject }) {
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
function _VisualCollider({ collider }: { collider: AssetCollider }) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      // only outline for now
      g.lineStyle(4, collider.destroyBullet ? 0x00ff00 : 0x0000ff);
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
      collider.destroyBullet,
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
const VisualCollider = memo(_VisualCollider, (prev, next) => {
  return lodash.isEqual(prev.collider, next.collider);
});
