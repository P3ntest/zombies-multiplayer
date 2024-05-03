import { DropShadowFilter } from "pixi-filters";
import { useMemo } from "react";
import { useLevelShadowSettings } from "../level/levelContext";

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

export function useEntityShadow() {
  const levelShadowSettings = useLevelShadowSettings();

  return useMemo(() => {
    const offsetMagnitude = 1 * levelShadowSettings.sunOffset;
    const offsetX =
      Math.cos(levelShadowSettings.sunDirection) * offsetMagnitude;
    const offsetY =
      Math.sin(levelShadowSettings.sunDirection) * offsetMagnitude;

    return new DropShadowFilter({
      blur: levelShadowSettings.shadowBlur,
      alpha: levelShadowSettings.shadowAlpha,
      quality: 4,
      offset: {
        x: offsetX,
        y: offsetY,
      },
    });
  }, [
    levelShadowSettings.shadowAlpha,
    levelShadowSettings.shadowBlur,
    levelShadowSettings.sunDirection,
    levelShadowSettings.sunOffset,
  ]);
}

export function useLevelObjectShadow(objectHeight: number) {
  const levelShadowSettings = useLevelShadowSettings();

  return useMemo(() => {
    const offsetMagnitude = objectHeight * levelShadowSettings.sunOffset;
    const offsetX =
      Math.cos(levelShadowSettings.sunDirection) * offsetMagnitude;
    const offsetY =
      Math.sin(levelShadowSettings.sunDirection) * offsetMagnitude;

    return new DropShadowFilter({
      blur: levelShadowSettings.shadowBlur,
      alpha: levelShadowSettings.shadowAlpha,
      quality: 4,
      offset: {
        x: offsetX,
        y: offsetY,
      },
    });
  }, [
    objectHeight,
    levelShadowSettings.shadowAlpha,
    levelShadowSettings.shadowBlur,
    levelShadowSettings.sunDirection,
    levelShadowSettings.sunOffset,
  ]);
}
