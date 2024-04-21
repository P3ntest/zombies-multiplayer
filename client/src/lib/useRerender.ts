import { useState } from "react";

export function useRerender() {
  const [, setTick] = useState(0);
  return () => setTick((tick) => tick + 1);
}
