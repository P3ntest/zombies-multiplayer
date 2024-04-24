import { TilingSprite } from "@pixi/react";
import { Wall } from "./Wall";
import { SpawnPoint } from "./level/SpawnPoint";

const map = `
0000000000
0XXXXX00X0
00000X0XX0
00XX0X0000
0000000000
00X00XX000
00X00X0000
0XXX000XX0
0X000X0000
00000X0000
`;

export function Level() {
  return (
    <>
      <TilingSprite
        tilePosition={{ x: 100, y: 100 }}
        // tileScale={{ x: 1, y: 1 }}
        image="/assets/sand.jpg"
        width={3000}
        height={3000}
      />
      <Wall x={1500} y={-100} width={3000} height={200} />
      <Wall x={1500} y={3100} width={3000} height={200} />
      <Wall x={-100} y={1500} width={200} height={3400} />
      <Wall x={3100} y={1500} width={200} height={3400} />

      <SpawnPoint type="player" x={100} y={100} />
      <SpawnPoint type="zombie" x={-500} y={-500} />

      {map.split("\n").map((row, y) =>
        row.split("").map((cell, x) => {
          if (cell === "X") {
            return (
              <Wall
                key={`${x}-${y}`}
                x={x * 300 + 150}
                y={y * 300 - 150}
                width={300}
                height={300}
              />
            );
          } else {
            return null;
            // <SpawnPoint
            //   type="zombie"
            //   key={`${x}-${y}`}
            //   x={x * 300 + 150}
            //   y={y * 300 - 150}
            // />
          }
        })
      )}
    </>
  );
}
