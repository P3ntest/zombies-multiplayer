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

export const Collider = Transform.extend({
  shape: ColliderShape,
});

export const AssetObject = Transform.extend({
  objectType: z.literal("asset"),
  colliders: z.array(Collider),
});

export const SpawnPoint = Transform.extend({
  objectType: z.literal("spawnPoint"),
  spawns: z.enum(["player", "zombie"]),
});

export const MapObject = z.discriminatedUnion("objectType", [
  AssetObject,
  SpawnPoint,
]);

export const GameLevel = z.object({
  objects: z.array(MapObject),
});

export type GameLevel = z.infer<typeof GameLevel>;
