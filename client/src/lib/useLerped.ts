import { useTick } from "@pixi/react";
import { useState } from "react";

export function useLerped(value: number, factor: number) {
  const [lerped, setLerped] = useState(value);

  useTick((delta) => {
    setLerped((lerped) => lerped + (value - lerped) * factor * delta);
  });

  return lerped;
}

export function useLerpedRadian(value: number, factor: number) {
  const [lerped, setLerped] = useState(value);

  useTick((deltaTime) => {
    setLerped((lerped) => {
      const diff = value - lerped;
      const delta =
        Math.atan2(Math.sin(diff), Math.cos(diff)) * factor * deltaTime;
      return lerped + delta;
    });
  });

  return lerped;
}

export function useLerpedVec2(value: { x: number; y: number }, factor: number) {
  return {
    x: useLerped(value.x, factor),
    y: useLerped(value.y, factor),
  };
}
