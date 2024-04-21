import { Assets, Texture } from "pixi.js";
import { useEffect, useState } from "react";

const assetMap = new Map<string, Texture | "loading">();
const loadCallbacks = new Map<string, Set<() => void>>();

export function useAsset(url: string): Texture | null {
  const [asset, setAsset] = useState<Texture | null>(null);

  useEffect(() => {
    if (assetMap.has(url)) {
      const asset = assetMap.get(url);
      if (asset === "loading") {
        if (!loadCallbacks.has(url)) {
          loadCallbacks.set(url, new Set());
        }
        loadCallbacks.get(url)!.add(() => {
          setAsset(assetMap.get(url)! as Texture);
        });
      } else {
        setAsset(asset as Texture);
      }
    } else {
      assetMap.set(url, "loading");
      Assets.load(url).then((texture) => {
        assetMap.set(url, texture);
        if (loadCallbacks.has(url)) {
          for (const callback of loadCallbacks.get(url)!) {
            callback();
          }
          loadCallbacks.delete(url);
        }
      });
    }
  }, [url]);

  return asset;
}
