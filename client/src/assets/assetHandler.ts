import { create } from "zustand";
import { zombieAtlas } from "./spritesheets/zombie";
import { Assets, Spritesheet, Texture } from "pixi.js";
import { loadPlayerAnimationSprites } from "./spritesheets/playerAnimationAtlas";

interface AssetStore {
  ready: boolean;
  setReady: (ready: boolean) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const useAssetStore = create<AssetStore>((set) => ({
  ready: false,
  setReady: (ready: boolean) => set({ ready }),
  isLoading: false,
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
}));

const atlasMap = {
  zombieAtlas,
} as const;

export const spriteSheets: Record<keyof typeof atlasMap, Spritesheet> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  {} as any;

export function useEnsureAssetsLoaded() {
  const { ready, setReady, isLoading, setIsLoading } = useAssetStore();

  if (!ready && !isLoading) {
    setIsLoading(true);
    loadAssets().then(() => {
      setReady(true);
      setIsLoading(false);
    });
  }
}

const additionalResources = [
  "/assets/player/texture-0.json",
  "/assets/player/texture-2.json",
  "/assets/player/texture-1.json",
  "/assets/blood.png",
];

async function loadAssets() {
  // load all textures
  const textures = [
    ...Object.values(atlasMap).map((atlas) => atlas.meta.image),
    ...additionalResources,
  ];
  await Assets.load(textures);

  // load all spritesheets
  await Promise.all([
    ...Object.entries(atlasMap).map(async ([key, atlas]) => {
      const sheet = new Spritesheet(Texture.from(atlas.meta.image!), atlas);
      await sheet.parse();
      spriteSheets[key as keyof typeof atlasMap] = sheet;
    }),
    loadPlayerAnimationSprites(),
  ]);
}
