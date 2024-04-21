export const PlayerGun = ["pistol", "rifle", "shotgun", "knife"];
export type PlayerGun = (typeof PlayerGun)[number];
export const PlayerAnimation = ["idle", "walk"];
export type PlayerAnimation = (typeof PlayerAnimation)[number];

const texturePrefix = "/assets/Top_Down_Survivor";

export const playerAnimationSprites: Record<
  PlayerGun,
  Record<
    PlayerAnimation,
    {
      frames: string[];
      animationSpeed?: number;
    }
  >
> = {
  pistol: {
    idle: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) =>
            `${texturePrefix}/handgun/idle/survivor-idle_handgun_${i}.png`
        ),
      animationSpeed: 0.2,
    },
    walk: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) =>
            `${texturePrefix}/handgun/move/survivor-move_handgun_${i}.png`
        ),
      animationSpeed: 0.5,
    },
  },
  rifle: {
    idle: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) => `${texturePrefix}/rifle/idle/survivor-idle_rifle_${i}.png`
        ),
      animationSpeed: 0.2,
    },
    walk: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) => `${texturePrefix}/rifle/move/survivor-move_rifle_${i}.png`
        ),
      animationSpeed: 0.5,
    },
  },
  shotgun: {
    idle: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) =>
            `${texturePrefix}/shotgun/idle/survivor-idle_shotgun_${i}.png`
        ),
      animationSpeed: 0.2,
    },
    walk: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) =>
            `${texturePrefix}/shotgun/move/survivor-move_shotgun_${i}.png`
        ),
      animationSpeed: 0.5,
    },
  },
  knife: {
    idle: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) => `${texturePrefix}/knife/idle/survivor-idle_knife_${i}.png`
        ),
      animationSpeed: 0.2,
    },
    walk: {
      frames: new Array(20)
        .fill(null)
        .map(
          (_, i) => `${texturePrefix}/knife/move/survivor-move_knife_${i}.png`
        ),
      animationSpeed: 0.5,
    },
  },
};

export const feetAnimations = {
  run: {
    frames: new Array(20)
      .fill(null)
      .map((_, i) => `${texturePrefix}/feet/run/survivor-run_${i}.png`),
    animationSpeed: 0.3,
  },
  strafe_left: {
    frames: new Array(20)
      .fill(null)
      .map(
        (_, i) =>
          `${texturePrefix}/feet/strafe_left/survivor-strafe_left_${i}.png`
      ),
    animationSpeed: 0.5,
  },
  strafe_right: {
    frames: new Array(20)
      .fill(null)
      .map(
        (_, i) =>
          `${texturePrefix}/feet/strafe_right/survivor-strafe_right_${i}.png`
      ),
    animationSpeed: 0.5,
  },
  idle: {
    frames: [`${texturePrefix}/feet/idle/survivor-idle_0.png`],
    animationSpeed: 0.5,
  },
} as const;
