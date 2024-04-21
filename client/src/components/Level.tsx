import { TilingSprite } from "@pixi/react";
import { Wall } from "./Wall";

export function Level() {
  return (
    <>
      <TilingSprite
        tilePosition={{ x: 100, y: 100 }}
        // tileScale={{ x: 1, y: 1 }}
        image="/assets/sand.jpg"
        width={2000}
        height={2000}
      />
      <Wall x={1000} y={-100} width={2000} height={200} />
      <Wall x={1000} y={2100} width={2000} height={200} />
      <Wall x={-100} y={1000} width={200} height={2400} />
      <Wall x={2100} y={1000} width={200} height={2400} />
      <Wall x={500} y={500} width={500} height={500} />
      <Wall x={1500} y={500} width={500} height={500} />
      <Wall x={500} y={1500} width={500} height={500} />
      <Wall x={1500} y={1500} width={500} height={500} />
    </>
  );
}
