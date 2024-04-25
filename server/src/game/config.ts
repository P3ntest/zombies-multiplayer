export const playerConfig = {
  healthUpgrade: {
    type: "lin",
    factor: 20,
  } as UpgradeCalc,
  speedUpgrade: {
    type: "lin",
    factor: 0.3,
  } as UpgradeCalc,
  zoomUpgrade: {
    type: "lin",
    factor: 0.625,
  } as UpgradeCalc,
  startingHealth: 100,
  baseZoom: 1.25,
  baseSpeed: 1,
};

export const weaponConfig = {
  damageUpgrade: {
    type: "exp",
    factor: 1.4,
  } as UpgradeCalc,
  fireRateUpgrade: {
    type: "exp",
    factor: 1.2,
  } as UpgradeCalc,
  pierceUpgrade: {
    type: "add",
    factor: 1,
  } as UpgradeCalc,
  weapons: {
    pistol: {
      damage: 30,
      knockBack: 1,
      fireRate: 10, // 10 = 1 bullet per second
      pierce: 2,
      range: 10,
      bulletSpeed: 30,
    },
    shotgun: {
      damage: 10,
      knockBack: 0.5,
      fireRate: 10,
      pierce: 1,
      range: 8,
      bulletSpeed: 20,
    },
    rifle: {
      damage: 15,
      knockBack: 0.05,
      fireRate: 60,
      pierce: 1,
      range: 10,
      bulletSpeed: 20,
    },
    melee: {
      damage: 20,
      knockBack: 0,
      fireRate: 15,
      pierce: 10,
      range: 1,
      bulletSpeed: 20,
    },
  },
};

export const upgradeConfig = [
  {
    id: "damage",
    name: "Damage",
    maxLevel: 10,
    cost: {
      type: "exp",
      factor: 3,
      base: 30,
    } as UpgradeCalc,
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    maxLevel: 5,
    cost: {
      type: "exp",
      factor: 3,
      base: 30,
    } as UpgradeCalc,
  },
  {
    id: "pierce",
    name: "Pierce",
    maxLevel: 5,
    cost: {
      type: "exp",
      factor: 3,
      base: 50,
    } as UpgradeCalc,
  },
  {
    id: "health",
    name: "Health",
    maxLevel: 5,
    cost: {
      type: "exp",
      factor: 3,
      base: 20,
    } as UpgradeCalc,
  },
  {
    id: "speed",
    name: "Speed",
    maxLevel: 3,
    cost: {
      type: "exp",
      factor: 3,
      base: 60,
    } as UpgradeCalc,
  },
  {
    id: "scope",
    name: "Scope",
    maxLevel: 3,
    cost: {
      type: "exp",
      factor: 4,
      base: 60,
    } as UpgradeCalc,
  },
];

export const coinConfig = {
  spawnMultiplier: 0.08,
};
export interface UpgradeCalc {
  type: "lin" | "exp" | "add";
  factor: number;
  base?: number;
}

export function calcUpgrade(
  upgrade: UpgradeCalc,
  level: number,
  base?: number
) {
  if (base == null) base = upgrade.base!;
  switch (upgrade.type) {
    case "lin":
      return base + upgrade.factor * level;
    case "exp":
      return base * Math.pow(upgrade.factor, level);
    case "add":
      return base + upgrade.factor * level;
  }
}
