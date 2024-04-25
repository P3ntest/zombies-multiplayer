export const playerConfig = {
  startingHealth: 100,
  walkingSpeed: (direction: number, speedUpgrades: number) =>
    direction + speedUpgrades * direction * 0.3,
  zoom: (zoomUpgrades: number) => 0.8 / (zoomUpgrades * 0.5 + 1),
  maxHealth: (healthUpgrades: number) => 100 + 20 * healthUpgrades,
};

export const weaponConfig = {
  damageMultiplier: (damageUpgrades: number) => 1.4 ** damageUpgrades,
  fireRateMultiplier: (fireRateUpgrades: number) => 1.2 ** fireRateUpgrades,
  pierceAdd: (pierceUpgrades: number) => pierceUpgrades,
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
    cost: (level: number) => Math.round(Math.pow(3, level) * 30),
  },
  {
    id: "fireRate",
    name: "Fire Rate",
    maxLevel: 5,
    cost: (level: number) => Math.round(Math.pow(3, level) * 30),
  },
  {
    id: "pierce",
    name: "Pierce",
    maxLevel: 5,
    cost: (level: number) => Math.round(Math.pow(3, level) * 50),
  },
  {
    id: "health",
    name: "Health",
    maxLevel: 5,
    cost: (level: number) => Math.round(Math.pow(3, level) * 20),
  },
  {
    id: "speed",
    name: "Speed",
    maxLevel: 3,
    cost: (level: number) => Math.round(Math.pow(3, level) * 60),
  },
  {
    id: "scope",
    name: "Scope",
    maxLevel: 3,
    cost: (level: number) => Math.round(Math.pow(4, level) * 60),
  },
];

export const coinConfig = {
  spawnMultiplier: 0.08,
};
