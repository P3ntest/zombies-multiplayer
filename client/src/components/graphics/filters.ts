import { DropShadowFilter } from "pixi-filters";

export function getEntityFilters() {
  return [
    new DropShadowFilter({
      blur: 0.2,
      quality: 0,
      alpha: 0.4,
      offset: {
        x: 7,
        y: 10,
      },
    }),
  ];
}
