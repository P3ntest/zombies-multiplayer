import { ArraySchema, MapSchema, Schema, type } from "@colyseus/schema";
import { PlayerClass } from "../../game/player";
import { ZombieType } from "../../game/zombies";
import { playerConfig } from "../../game/config";

export const PlayerHealthState = {
  ALIVE: 0,
  DEAD: 1,
  NOT_SPAWNED: 2,
};

export class PlayerUpgradeState extends Schema {
  @type("uint8") fireRate: number = 0;
  @type("uint8") damage: number = 0;
  @type("uint8") pierce: number = 0;
  @type("uint8") health: number = 0;
  @type("uint8") speed: number = 0;
  @type("uint8") scope: number = 0;
}

export class PlayerState extends Schema {
  @type("string") name: string = "Unnamed";
  @type("string") sessionId: string = "";

  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;

  @type("boolean") connected: boolean = true;

  @type("number") velocityX: number = 0;
  @type("number") velocityY: number = 0;

  @type("number") health: number = playerConfig.startingHealth;
  @type("uint8") healthState: number = PlayerHealthState.NOT_SPAWNED;

  @type("uint32") coins: number = 1000;

  @type("string") playerClass: PlayerClass = "pistol";

  @type(PlayerUpgradeState) upgrades = new PlayerUpgradeState();

  @type("number") kills: number = 0;
  @type("number") deaths: number = 0;
  @type("number") damageDealt: number = 0;
  @type("number") wavesSurvived: number = 0;
  @type("number") accuracy: number = 0;

  @type("uint8") currentAnimation = 0;
}

export class ZombieState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") rotation: number = 0;
  @type("string") playerId: string = "";
  @type("number") health: number = 100;
  @type("number") maxHealth: number = 100;
  @type("string") targetPlayerId: string = "";

  @type("uint32") lastAttackTick: number = 0;
  @type("uint32") attackCoolDownTicks: number = 20;

  @type("string") zombieType: ZombieType = "normal";
}

export class BulletState extends Schema {
  @type("string") id: string = "";
  @type("string") playerId: string = "";
  @type("number") originX: number = 0;
  @type("number") originY: number = 0;
  @type("number") rotation: number = 0;
  @type("number") speed: number = 0;
  @type("number") damage: number = 0;
  @type("uint8") piercesLeft: number = 0;
  @type("float32") knockBack: number = 1;
}

export class WaveInfoState extends Schema {
  @type("number") currentWaveNumber: number = 0;
  @type("boolean") active: boolean = false;
  @type("number") nextWaveStartsInSec: number = 0;
}

export class CoinState extends Schema {
  @type("string") id: string = "";
  @type("number") x: number = 0;
  @type("number") y: number = 0;
  @type("number") value: number = 1;
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

  @type(WaveInfoState)
  waveInfo = new WaveInfoState();

  @type({
    array: CoinState,
  })
  coins = new ArraySchema<CoinState>();

  @type("boolean")
  isGameOver = false;
}
