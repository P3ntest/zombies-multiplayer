import { transformer, z } from "zod";

// a type that accepts strings but
const FloatLike = z.union([z.string(), z.number()]).transform((val, ctx) => {
  if (typeof val === "string") {
    const num = parseFloat(val);
    if (isNaN(num)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected a number",
      });
      return z.NEVER;
    }
    return num;
  }
  return val;
});

const IntLike = FloatLike.transform((n) => Math.round(n));

const Transform = z.object({
  x: IntLike,
  y: IntLike,
  scale: FloatLike,
  rotation: FloatLike,
});

export const ColliderShape = z.discriminatedUnion("shape", [
  z.object({
    shape: z.literal("circle"),
    radius: IntLike,
  }),
  z.object({
    shape: z.literal("rectangle"),
    width: IntLike,
    height: IntLike,
  }),
]);

export const AssetCollider = Transform.omit({
  scale: true,
}).extend({
  shape: ColliderShape,
  destroyBullet: z.boolean().default(true),
});

export const BuiltInAsset = z.object({
  assetSource: z.literal("builtIn"),
  assetPath: z.string(),
});

export const CustomAsset = z.object({
  assetSource: z.literal("custom"),
  uploadId: z.string(),
});

// export const ExternalAsset = z.object({
//   assetSource: z.literal("external"),
//   assetUrl: z.string(),
// });

export const AssetSource = z.discriminatedUnion("assetSource", [
  BuiltInAsset,
  CustomAsset,
  // ExternalAsset,
]);

export const AssetObject = Transform.extend({
  objectType: z.literal("asset"),
  colliders: z.array(AssetCollider),
  sprite: AssetSource,
  id: z.string(),

  zHeight: IntLike.default(0),

  tiling: z.boolean(),
  width: IntLike,
  height: IntLike,
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
export type CustomAsset = z.infer<typeof CustomAsset>;
// export type ExternalAsset = z.infer<typeof ExternalAsset>;
export type AssetSource = z.infer<typeof AssetSource>;
