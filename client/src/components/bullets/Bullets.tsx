import { Container, Graphics, ParticleContainer, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { BulletState } from "../../../../server/src/rooms/schema/MyRoomState";
import { useCallback, useState } from "react";
import {
  getBodyMeta,
  useBodyRef,
  useFilteredOnCollisionStart,
  useOnCollisionStart,
} from "../../lib/physics/hooks";
import { Bodies, Body } from "matter-js";
import { useRerender } from "../../lib/useRerender";
import { bulletHitListeners } from "./bullet";

export function Bullets() {
  const state = useColyseusState((state) => state.bullets);

  return (
    <Container>
      {state?.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </Container>
  );
}

function Bullet({ bullet }: { bullet: BulletState }) {
  const sessionId = useColyseusRoom()?.sessionId;
  const isMe = bullet.playerId === sessionId;

  if (isMe) {
    return <MyBullet bullet={bullet} />;
  } else {
    return <OtherBullet bullet={bullet} />;
  }
}

function MyBullet({ bullet }: { bullet: BulletState }) {
  const room = useColyseusRoom();
  const rerender = useRerender();
  const [localDestroyed, setLocalDestroyed] = useState(false); // so the bullet doesn't go through the wall on the client

  const body = useBodyRef(
    () => Bodies.circle(bullet.originX, bullet.originY, 5, { isSensor: true }),
    { tags: ["bullet", "localBullet"] }
  );

  const destroyBullet = useCallback(() => {
    if (localDestroyed) return;
    room?.send("destroyBullet", { id: bullet.id });
    setLocalDestroyed(true);
  }, [room, bullet, localDestroyed]);

  useFilteredOnCollisionStart(body.current, (pair) => {
    const otherMeta = getBodyMeta(pair.bodyOther);
    if (otherMeta?.tags?.includes("destroyBullet")) {
      destroyBullet();
    }
    if (bulletHitListeners.has(pair.bodyOther)) {
      for (const listener of bulletHitListeners.get(pair.bodyOther)!) {
        listener(bullet);
      }
    }
  });

  useTick((delta) => {
    const dx = Math.cos(bullet.rotation) * bullet.speed * delta;
    const dy = Math.sin(bullet.rotation) * bullet.speed * delta;

    Body.translate(body.current, { x: dx, y: dy });

    const x = body.current.position.x;
    const y = body.current.position.y;

    const distance = Math.sqrt(
      (x - bullet.originX) ** 2 + (y - bullet.originY) ** 2
    );

    if (distance > 10000) {
      room?.send("destroyBullet", { id: bullet.id });
    }

    rerender();
  });

  if (localDestroyed) return null;

  return (
    <BulletGraphics x={body.current.position.x} y={body.current.position.y} />
  );
}

function OtherBullet({ bullet }: { bullet: BulletState }) {
  const [x, setX] = useState(bullet.originX);
  const [y, setY] = useState(bullet.originY);

  useTick((delta) => {
    const dx = Math.cos(bullet.rotation) * bullet.speed * delta;
    const dy = Math.sin(bullet.rotation) * bullet.speed * delta;

    setX((x) => x + dx);
    setY((y) => y + dy);
  });

  return <BulletGraphics x={x} y={y} />;
}

function BulletGraphics({ x, y }: { x: number; y: number }) {
  return (
    <Graphics
      x={x}
      y={y}
      draw={(g) => {
        g.beginFill(0x433);
        g.drawCircle(0, 0, 5);
        g.endFill();
      }}
    />
  );
}
