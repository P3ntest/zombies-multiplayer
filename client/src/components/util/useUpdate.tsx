import { useCallback, useState } from "react";

export function useUpdate() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((tick) => (tick + 1) % 100000), []);
}
