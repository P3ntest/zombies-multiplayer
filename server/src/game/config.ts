export const playerConfig = {
  healthUpgrade: {
    type: "lin",
    factor: 80,
  } as WaveBasedFunction,
  speedUpgrade: {
    type: "lin",
    factor: 0.3,
  } as WaveBasedFunction,
  zoomUpgrade: {
    type: "lin",
    factor: 0.625,
  } as WaveBasedFunction,
  startingHealth: 100,
  baseZoom: 1.25,
  baseSpeed: 1,
};

export const weaponConfig = {
  damageUpgrade: {
    type: "exp",
    factor: 1.4,
  } as WaveBasedFunction,
  fireRateUpgrade: {
    type: "exp",
    factor: 1.2,
  } as WaveBasedFunction,
  pierceUpgrade: {
    type: "add",
    factor: 1,
  } as WaveBasedFunction,
  weapons: {
    pistol: {
      //4800 dmg per second
      damage: 40,
      knockBack: 1,
      fireRate: 10, // 10 = 1 bullet per second
      pierce: 2,
      range: 10,
      bulletSpeed: 30,
    },
    shotgun: {
      //4500 dmg per second
      damage: 15,
      knockBack: 0.5,
      fireRate: 10,
      pierce: 1,
      range: 8,
      bulletSpeed: 20,
      bulletAmount: 5,
    },
    rifle: {
      //5400 dmg per second
      damage: 15,
      knockBack: 0.05,
      fireRate: 52,
      pierce: 1,
      range: 10,
      bulletSpeed: 20,
    },
    melee: {
      //2970 dmg per second
      damage: 33,
      knockBack: 0,
      fireRate: 15,
      pierce: 10,
      range: 1,
      bulletSpeed: 20,
    },
  },
};

export const skillPointConfig = {
  multiplier: 1,
};

export const upgradeConfig = [
  {
    id: "damage",
    name: "Damage",
    maxLevel: 10,
    cost: {
      type: "lin",
      factor: 1,
      base: 1,
    } as WaveBasedFunction,
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    maxLevel: 5,
    cost: {
      type: "lin",
      factor: 1,
      base: 1,
    } as WaveBasedFunction,
  },
  {
    id: "pierce",
    name: "Pierce",
    maxLevel: 5,
    cost: {
      type: "lin",
      factor: 2,
      base: 2,
    } as WaveBasedFunction,
  },
  {
    id: "health",
    name: "Health",
    maxLevel: 5,
    cost: {
      type: "lin",
      factor: 1,
      base: 1,
    } as WaveBasedFunction,
  },
  {
    id: "speed",
    name: "Speed",
    maxLevel: 3,
    cost: {
      type: "lin",
      factor: 2,
      base: 2,
    } as WaveBasedFunction,
  },
  {
    id: "scope",
    name: "Scope",
    maxLevel: 3,
    cost: {
      type: "lin",
      factor: 3,
      base: 3,
    } as WaveBasedFunction,
  },
];

export const waveConfig = {
  zombies: {
    type: "exp",
    factor: 1.1,
    base: 30,
    max: 100,
  } as WaveBasedFunction,
  zombieSpawnInterval: {
    max: 40,
    factor: -60,
    base: 1000,
  },
  zombieHealthMultiplier: {
    type: "exp",
    factor: 1.15,
  } as WaveBasedFunction,
  zombieAttackMultiplier: {
    type: "exp",
    factor: 1.15,
  } as WaveBasedFunction,
  spawnChances: {
    normal: 100,
    baby: {
      max: 40,
      factor: 5,
    } as SpawnChance,
    greenMutant: {
      max: 40,
      factor: 2,
    } as SpawnChance,
    tank: {
      max: 10,
      factor: 1,
    } as SpawnChance,
    blueMutant: {
      max: 40,
      factor: 1,
    } as SpawnChance,
  },
  postDelay: 5000,
};
export type WaveBasedFunction = {
  type: "lin" | "exp" | "add";
  factor: number;
  base?: number;
  max?: number;
};

export type SpawnChance = {
  max: number;
  factor: number;
};

export function callWaveBasedFunction(
  upgrade: WaveBasedFunction,
  level: number,
  base?: number
) {
  if (base == null) base = upgrade.base || 1;
  function value() {
    switch (upgrade.type) {
      case "lin":
        return base + upgrade.factor * level;
      case "exp":
        return base * Math.pow(upgrade.factor, level);
      case "add":
        return base + upgrade.factor * level;
    }
  }
  return Math.min(upgrade.max || Infinity, value());
}
