import { Schema, Context, type, MapSchema } from "@colyseus/schema";

export class PlayerState extends Schema {
  @type("string") name: string = "Unknown";
  @type("string") sessionId: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;
}

export class MyRoomState extends Schema {
  @type({
    map: PlayerState,
  })
  players = new MapSchema<PlayerState>();
}
