import { SpriteSheetJson } from "pixi.js";

const numFrames = 17;
const width = 4896;
const widthPerFrame = width / numFrames;

export const zombieAtlas: SpriteSheetJson = {
  meta: {
    image: "assets/zombie/zombie.png",
    scale: "1",
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
