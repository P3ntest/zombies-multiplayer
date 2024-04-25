import { transformer, z } from "zod";

const Transform = z.object({
  x: z.number(),
  y: z.number(),
  scale: z.number(),
  rotation: z.number(),
});

export const ColliderShape = z.discriminatedUnion("shape", [
  z.object({
    shape: z.literal("circle"),
    radius: z.number(),
  }),
  z.object({
    shape: z.literal("rectangle"),
    width: z.number(),
    height: z.number(),
  }),
]);

export const AssetCollider = Transform.omit({
  scale: true,
}).extend({
  shape: ColliderShape,
});

export const BuiltInAsset = z.object({
  assetSource: z.literal("builtIn"),
  assetPath: z.string(),
});

export const ExternalAsset = z.object({
  assetSource: z.literal("external"),
  assetUrl: z.string(),
});

export const AssetSource = z.discriminatedUnion("assetSource", [
  BuiltInAsset,
  ExternalAsset,
]);

export const AssetObject = Transform.extend({
  objectType: z.literal("asset"),
  colliders: z.array(AssetCollider),
  sprite: AssetSource,
  id: z.string(),

  tiling: z.boolean(),
  width: z.number(),
  height: z.number(),
});

export const SpawnPoint = Transform.extend({
  objectType: z.literal("spawnPoint"),
  spawns: z.enum(["player", "zombie"]),
  id: z.string(),
});

export const MapObject = z.discriminatedUnion("objectType", [
  AssetObject,
  SpawnPoint,
]);

export const GameLevel = z.object({
  objects: z.array(MapObject),
});

export type GameLevel = z.infer<typeof GameLevel>;
export type MapObject = z.infer<typeof MapObject>;
export type AssetObject = z.infer<typeof AssetObject>;
export type SpawnPoint = z.infer<typeof SpawnPoint>;
export type AssetCollider = z.infer<typeof AssetCollider>;
export type ColliderShape = z.infer<typeof ColliderShape>;
export type BuiltInAsset = z.infer<typeof BuiltInAsset>;
export type ExternalAsset = z.infer<typeof ExternalAsset>;
export type AssetSource = z.infer<typeof AssetSource>;
