import { Schema, ArraySchema, type, MapSchema } from "@colyseus/schema";

export const PlayerHealthState = {
  ALIVE: 0,
  DEAD: 1,
};

export class PlayerState extends Schema {
  @type("string") name: string = "Unknown";
  @type("string") sessionId: string = "";

  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;

  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;

  @type("number") health: number = 100;
  @type("uint8") healthState: number = PlayerHealthState.ALIVE;
}

export class ZombieState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;
  @type("string") playerId: string = "";
  @type("number") health: number = 100;
  @type("string") targetPlayerId: string = "";

  @type("uint32") lastAttackTick: number = 0;
  @type("uint32") attackCoolDownTicks: number = 20;
}

export class BulletState extends Schema {
  @type("string") id: string = "";
  @type("string") playerId: string = "";
  @type("number") originX: number = 0;
  @type("number") originY: number = 0;
  @type("number") rotation: number = 0;
  @type("number") speed: number = 0;
}

export class WaveInfoState extends Schema {
  @type("number") currentWaveNumber: number = 0;
  @type("boolean") active: boolean = false;
  @type("number") nextWaveStartsIn: number = 0;
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

  @type({
    array: ZombieState,
  })
  zombies = new ArraySchema<ZombieState>();

  @type("uint32")
  gameTick = 0;
}
