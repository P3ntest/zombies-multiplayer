export type ZombieType = "normal" | "baby";

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
} as const;
