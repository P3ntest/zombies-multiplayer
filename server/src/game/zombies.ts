export type ZombieType =
  | "normal"
  | "baby"
  | "greenMutant"
  | "tank"
  | "mutatedBaby"
  | "blueMutant";

export const zombieInfo: Record<
  ZombieType,
  {
    baseHealth: number;
    baseSpeed: number;
    baseAttackDamage: number;
    size: number;
    attackDelayTicks?: number;
    tint?: string | number;
    glow?: number;
  }
> = {
  normal: {
    baseHealth: 100,
    baseSpeed: 1,
    baseAttackDamage: 10,
    size: 1,
  },
  baby: {
    baseHealth: 30,
    baseSpeed: 3,
    baseAttackDamage: 10,
    attackDelayTicks: 0,
    size: 0.7,
  },
  mutatedBaby: {
    baseHealth: 50,
    baseSpeed: 3.5,
    baseAttackDamage: 20,
    attackDelayTicks: 0,
    size: 0.7,
    tint: 0xccccff,
    glow: 0x0000ff,
  },
  greenMutant: {
    baseHealth: 200,
    baseSpeed: 1,
    baseAttackDamage: 20,
    size: 1,
    tint: 0x00ff00,
    glow: 0x00ff00,
  },
  tank: {
    baseHealth: 600,
    baseSpeed: 0.8,
    baseAttackDamage: 110,
    size: 1.9,
  },
  blueMutant: {
    baseHealth: 300,
    baseSpeed: 1.3,
    baseAttackDamage: 30,
    size: 1.4,
    tint: 0x8888ff,
  },
} as const;
