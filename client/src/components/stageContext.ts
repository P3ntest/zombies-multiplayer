import { createContext } from "react";
import * as PIXI from "pixi.js";

interface StageContextState {
  levelContainer: PIXI.Container | null;
}

export const stageContext = createContext<StageContextState | null>(null);
export const StageProvider = stageContext.Provider;
