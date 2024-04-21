import { Spritesheet, SpritesheetData, Texture } from "pixi.js";

const numFrames = 17;
const width = 4896;
const widthPerFrame = width / numFrames;

export const atlas: SpritesheetData = {
  meta: {
    image: "assets/zombie/zombie.png",
    size: {
      w: width,
      h: 311,
    },
    scale: 1,
  },
  frames: Object.fromEntries(
    Array.from({ length: numFrames }).map((_, i) => [
      `zombie-${i}`,
      {
        frame: {
          x: i * widthPerFrame,
          y: 0,
          w: widthPerFrame,
          h: 311,
        },
        anchor: {
          x: 0.5,
          y: 0.5,
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: {
          x: 0,
          y: 0,
          w: widthPerFrame,
          h: 311,
        },
        sourceSize: {
          w: widthPerFrame,
          h: 311,
        },
      } as SpritesheetData["frames"]["zombie-0"],
    ])
  ),
  animations: {
    walk: Array.from({ length: numFrames }).map((_, i) => `zombie-${i}`),
  },
};

// export const zombieSpriteSheet = new Spritesheet(
//   Texture.from("/assets/zombie/zombie.png"),
//   atlas
// );

// await zombieSpriteSheet.parse();
