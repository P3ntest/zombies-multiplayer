type LevelAsset = {
  type: "asset";
  x: number;
  y: number;
  asset: AssetSource;
  scale: number;
  rotation: number;
};

type AssetSource = {
  source: "included";
  identifier: string;
};

type MetaObject = {
  type: "spawnPoint";
  x: number;
  y: number;
};
