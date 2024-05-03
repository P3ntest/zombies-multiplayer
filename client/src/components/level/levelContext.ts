import { createContext, useContext, useMemo } from "react";
import { GameLevel } from "../../../../server/src/game/mapEditor/editorTypes";

interface LevelContext {
  level: GameLevel;
}

const levelContext = createContext<LevelContext | null>(null);
export const LevelProvider = levelContext.Provider;

export const useLevel = () => {
  const context = useContext(levelContext);
  if (!context) {
    throw new Error("useLevel must be used within a LevelProvider");
  }
  return context;
};

export function useLevelShadowSettings() {
  return useMemo(() => {
    return {
      sunOffset: 10,
      sunDirection: 1,
      shadowAlpha: 0.4,
      shadowBlur: 0.2,
    };
  }, []);
}

export function usePaddedLevelBounds() {
  const { level } = useLevel();

  return useMemo(() => {
    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = 0;
    level.objects.forEach((object) => {
      minX = Math.min(minX, object.x);
      minY = Math.min(minY, object.y);
      maxX = Math.max(maxX, object.x);
      maxY = Math.max(maxY, object.y);
    });

    const PADDING = 1000;
    return {
      minX: minX - PADDING,
      minY: minY - PADDING,
      maxX: maxX + PADDING,
      maxY: maxY + PADDING,
    };
  }, [level.objects]);
}
