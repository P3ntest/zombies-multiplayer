import { AnimatedSprite, Container, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { ZombieState } from "../../../../server/src/rooms/schema/MyRoomState";
import { ZombieType, zombieInfo } from "../../../../server/src/game/zombies";
import { MyZombie } from "./MyZombie";
import { useLerped, useLerpedRadian } from "../../lib/useLerped";
import { useBodyRef } from "../../lib/physics/hooks";
import Matter, { Body } from "matter-js";
import { ComponentProps, useMemo } from "react";
import { useGrowling, useZombieBulletHitListener } from "./zombieHooks";
import { HealthBar } from "../HealthBar";
import {
  useNetworkTick,
  useRoomMessageHandler,
} from "../../lib/networking/hooks";
import {
  playZombieDead,
  playZombieGrowl,
  playZombieHitSound,
} from "../../lib/sound/sound";
import { spriteSheets } from "../../assets/assetHandler";
import { zombieUpdatesBatch } from "../../lib/networking/batches";
import { useEntityShadow } from "../graphics/filters";
import { GlowFilter } from "pixi-filters";
import { useZombieColliders } from "./zombieColliders";

export function Zombies() {
  const state = useColyseusState();
  const zombies = state?.zombies;
  const room = useColyseusRoom();

  useRoomMessageHandler("zombieHit", () => {
    playZombieHitSound();
    playZombieGrowl(0.5);
  });

  useRoomMessageHandler("zombieDead", () => {
    playZombieDead();
  });

  useNetworkTick(() => {
    room?.send("updateZombieBatch", Array.from(zombieUpdatesBatch));
    zombieUpdatesBatch.clear();
  });

  return (
    <Container>
      {zombies?.map((zombie) => (
        <Zombie key={zombie.id} zombie={zombie} />
      ))}
    </Container>
  );
}

function Zombie({ zombie }: { zombie: ZombieState }) {
  const sessionId = useColyseusRoom()?.sessionId;
  const isMe = zombie.playerId === sessionId;
  useGrowling();

  if (isMe) {
    return <MyZombie zombie={zombie} />;
  } else {
    return <OtherZombie zombie={zombie} />;
  }
}

function OtherZombie({ zombie }: { zombie: ZombieState }) {
  const colliders = useZombieColliders(
    zombie.zombieType,
    zombie.id,
    zombie.x,
    zombie.y
  );

  useZombieBulletHitListener(colliders.hitBox.current, zombie.id);

  const x = useLerped(zombie.x, 0.1);
  const y = useLerped(zombie.y, 0.1);
  const rotation = useLerpedRadian(zombie.rotation, 0.1);

  useTick(() => {
    Body.setPosition(colliders.collider.current, {
      x,
      y,
    });
  });

  return (
    <ZombieSprite
      type={zombie.zombieType}
      maxHealth={zombie.maxHealth}
      x={x}
      y={y}
      rotation={rotation}
      health={zombie.health}
    />
  );
}

export function ZombieSprite({
  x,
  y,
  rotation,
  health,
  maxHealth,
  type,
  ...other
}: {
  x: number;
  y: number;
  health: number;
  maxHealth: number;
  rotation: number;
  type: ZombieType;
} & Partial<ComponentProps<typeof AnimatedSprite>>) {
  const typeInfo = zombieInfo[type];

  const scale = 0.4 * typeInfo.size;

  const glow = useMemo(() => {
    if (!typeInfo.glow) {
      return;
    }

    return new GlowFilter({
      color: typeInfo.glow,
      distance: 5,
    });
  }, [typeInfo.glow]);

  const shadow = useEntityShadow();
  const filters = useMemo(() => [shadow, glow].filter(Boolean), [shadow, glow]);

  return (
    <Container x={x} y={y}>
      <AnimatedSprite
        rotation={rotation}
        animationSpeed={0.36 * typeInfo.baseSpeed}
        isPlaying
        textures={spriteSheets.zombieAtlas.animations.walk}
        tint={typeInfo.tint ?? 0xffffff}
        scale={{ x: scale, y: scale }}
        anchor={{ x: 0.35, y: 0.55 }}
        {...other}
        filters={filters}
      />
      <Container y={70}>
        <HealthBar health={health} maxHealth={maxHealth} />
      </Container>
    </Container>
  );
}
