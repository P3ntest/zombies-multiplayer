import { Graphics, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../colyseus";
import { BulletState } from "../../../server/src/rooms/schema/MyRoomState";
import { useState } from "react";

export function Bullets() {
  const state = useColyseusState((state) => state.bullets);

  console.log("bullets", state?.length);

  return (
    <>
      {state?.map((bullet) => (
        <Bullet key={bullet.id} bullet={bullet} />
      ))}
    </>
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
  const [x, setX] = useState(bullet.originX);
  const [y, setY] = useState(bullet.originY);
  const room = useColyseusRoom();

  useTick((delta) => {
    const dx = Math.cos(bullet.rotation) * bullet.speed * delta;
    const dy = Math.sin(bullet.rotation) * bullet.speed * delta;

    setX((x) => x + dx);
    setY((y) => y + dy);

    const distance = Math.sqrt(
      (x - bullet.originX) ** 2 + (y - bullet.originY) ** 2
    );

    if (distance > 800) {
      room?.send("destroyBullet", { id: bullet.id });
    }
  });

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

function OtherBullet({ bullet }: { bullet: BulletState }) {
  const [x, setX] = useState(bullet.originX);
  const [y, setY] = useState(bullet.originY);

  useTick((delta) => {
    const dx = Math.cos(bullet.rotation) * bullet.speed * delta;
    const dy = Math.sin(bullet.rotation) * bullet.speed * delta;

    setX((x) => x + dx);
    setY((y) => y + dy);
  });

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
