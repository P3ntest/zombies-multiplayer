import { createContext, useContext } from "react";
import * as PIXI from "pixi.js";

interface CameraContext {
  camera: PIXI.Container | null;
}

export const cameraContext = createContext<CameraContext | null>(null);
export const CameraProvider = cameraContext.Provider;

export function useCamera() {
  const context = useContext(cameraContext);
  if (!context) {
    throw new Error("useCamera must be used within a CameraProvider");
  }
  return context?.camera;
}
