import { TilingSprite } from "@pixi/react";
import { Wall } from "./Wall";

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
      <Wall x={100} y={100} width={100} height={200} />
      <Wall x={500} y={100} width={100} height={200} />
    </>
  );
}
