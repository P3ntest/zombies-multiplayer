import { Texture } from "pixi.js";

export const PlayerGun = ["pistol", "rifle", "shotgun"];
export type PlayerGun = (typeof PlayerGun)[number];
export const PlayerAnimation = ["idle", "walk", "melee"];
export type PlayerAnimation = (typeof PlayerAnimation)[number];

const texturePrefix = "Top_Down_Survivor";

export let playerAnimationSprites: Record<
  PlayerGun,
  Record<
    PlayerAnimation,
    {
      frames: Texture[];
      animationSpeed?: number;
    }
  >
>;

export let feetAnimations: Record<
  string,
  {
    frames: Texture[];
    animationSpeed: number;
  }
>;

function textureArrayFromPrefix(prefix: string, count: number) {
  return new Array(count)
    .fill(null)
    .map((_, i) => Texture.from(`${texturePrefix}/${prefix}_${i}.png`));
}

export const MELEE_ANIMATION_SPEED = 0.7;

export async function loadPlayerAnimationSprites() {
  playerAnimationSprites = {
    pistol: {
      idle: {
        frames: textureArrayFromPrefix(
          "handgun/idle/survivor-idle_handgun",
          20
        ),
        animationSpeed: 0.2,
      },
      walk: {
        frames: textureArrayFromPrefix(
          "handgun/move/survivor-move_handgun",
          20
        ),
        animationSpeed: 0.5,
      },
      melee: {
        frames: textureArrayFromPrefix(
          "handgun/meleeattack/survivor-meleeattack_handgun",
          15
        ),
        animationSpeed: MELEE_ANIMATION_SPEED,
      },
    },
    rifle: {
      idle: {
        frames: textureArrayFromPrefix("rifle/idle/survivor-idle_rifle", 20),
        animationSpeed: 0.2,
      },
      walk: {
        frames: textureArrayFromPrefix("rifle/move/survivor-move_rifle", 20),
        animationSpeed: 0.5,
      },
      melee: {
        frames: textureArrayFromPrefix(
          "rifle/meleeattack/survivor-meleeattack_rifle",
          15
        ),
        animationSpeed: MELEE_ANIMATION_SPEED,
      },
    },
    shotgun: {
      idle: {
        frames: textureArrayFromPrefix(
          "shotgun/idle/survivor-idle_shotgun",
          20
        ),
        animationSpeed: 0.2,
      },
      walk: {
        frames: textureArrayFromPrefix(
          "shotgun/move/survivor-move_shotgun",
          20
        ),
        animationSpeed: 0.5,
      },
      melee: {
        frames: textureArrayFromPrefix(
          "shotgun/meleeattack/survivor-meleeattack_shotgun",
          15
        ),
        animationSpeed: MELEE_ANIMATION_SPEED,
      },
    },
  };

  feetAnimations = {
    run: {
      frames: new Array(20)
        .fill(null)
        .map((_, i) =>
          Texture.from(`${texturePrefix}/feet/run/survivor-run_${i}.png`)
        ),
      animationSpeed: 0.3,
    },
    strafe_left: {
      frames: new Array(20)
        .fill(null)
        .map((_, i) =>
          Texture.from(
            `${texturePrefix}/feet/strafe_left/survivor-strafe_left_${i}.png`
          )
        ),
      animationSpeed: 0.5,
    },
    strafe_right: {
      frames: new Array(20)
        .fill(null)
        .map((_, i) =>
          Texture.from(
            `${texturePrefix}/feet/strafe_right/survivor-strafe_right_${i}.png`
          )
        ),
      animationSpeed: 0.5,
    },
    idle: {
      frames: [Texture.from(`${texturePrefix}/feet/idle/survivor-idle_0.png`)],
      animationSpeed: 0.5,
    },
  };
}
