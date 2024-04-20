import { TilingSprite } from "@pixi/react";

export function Level() {
  return (
    <>
      <TilingSprite
        tilePosition={{ x: 100, y: 100 }}
        // tileScale={{ x: 1, y: 1 }}
        image="/assets/sand.jpg"
        width={1000}
        height={1000}
      />
    </>
  );
}
