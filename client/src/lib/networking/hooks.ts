import { useEffect, useRef } from "react";

const networkTickRate = 20;

export function useNetworkTick(callback: () => void) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const interval = setInterval(() => {
      callbackRef.current();
    }, 1000 / networkTickRate);
    return () => {
      clearInterval(interval);
    };
  }, []);
}
