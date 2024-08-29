import {
  ArraySchema,
  CollectionSchema,
  MapSchema,
  Schema,
  type,
} from "@colyseus/schema";
import { ZombieType } from "../../game/zombies";
import { PlayerState } from "../Player";
import { BulletState } from "../Bullet";
import { VehicleState } from "../Vehicle";

export class ZombieState extends Schema {
  @type("uint32") id: number = 0;
  @type("int32") x: number = 0;
  @type("int32") y: number = 0;
  @type("float32") rotation: number = 0;
  @type("string") playerId: string = "";
  @type("uint32") health: number = 100;
  @type("uint32") maxHealth: number = 100;
  @type("string") targetPlayerId: string = "";

  @type("uint32") lastAttackTick: number = 0;
  @type("uint32") attackCoolDownTicks: number = 20;

  @type("string") zombieType: ZombieType = "normal";
}

export class WaveInfoState extends Schema {
  @type("uint32") currentWaveNumber: number = 0;
  @type("boolean") active: boolean = false;
  @type("uint16") nextWaveStartsInSec: number = 0;
  @type("uint32") totalZombies: number = 0;
  @type("uint32") zombiesLeft: number = 0;
}

export class MyRoomState extends Schema {
  @type({
    map: PlayerState,
  })
  players = new MapSchema<PlayerState>();

  @type({
    map: BulletState,
  })
  bullets = new MapSchema<BulletState>();

  @type({
    map: VehicleState,
  })
  vehicles = new MapSchema<VehicleState>();

  @type({
    array: ZombieState,
  })
  zombies = new ArraySchema<ZombieState>();

  @type("uint32")
  gameTick = 0;

  @type(WaveInfoState)
  waveInfo = new WaveInfoState();

  @type("boolean")
  isGameOver = false;

  @type("string")
  mapId: string = "";
}
