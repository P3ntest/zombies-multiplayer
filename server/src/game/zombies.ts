export type ZombieType =
  | "normal"
  | "baby"
  | "greenMutant"
  | "tank"
  | "blueMutant";

export const zombieInfo: Record<
  ZombieType,
  {
    baseHealth: number;
    baseSpeed: number;
    baseAttackDamage: number;
    size: number;
    tint?: string | number;
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
    size: 0.7,
  },
  greenMutant: {
    baseHealth: 200,
    baseSpeed: 1,
    baseAttackDamage: 20,
    size: 1,
    tint: 0x00ff00,
  },
  tank: {
    baseHealth: 1000,
    baseSpeed: 0.5,
    baseAttackDamage: 50,
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
