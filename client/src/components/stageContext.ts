import { createContext } from "react";
import * as PIXI from "pixi.js";

interface CameraContext {
  camera: PIXI.Container | null;
}

export const cameraContext = createContext<CameraContext | null>(null);
export const CameraProvider = cameraContext.Provider;
