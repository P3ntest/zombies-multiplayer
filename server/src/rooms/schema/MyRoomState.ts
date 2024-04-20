import { Schema, ArraySchema, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") name: string = "Unknown";
  @type("string") sessionId: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;
}

export class BulletState extends Schema {
  @type("string") id: string = "";
  @type("string") playerId: string = "";
  @type("number") originX: number = 0;
  @type("number") originY: number = 0;
  @type("number") rotation: number = 0;
  @type("number") speed: number = 0;
}

export class MyRoomState extends Schema {
  @type({
    map: PlayerState,
  })
  players = new MapSchema<PlayerState>();
  @type({
    array: BulletState,
  })
  bullets = new ArraySchema<BulletState>();
}
